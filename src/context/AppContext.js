import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageService } from '../services/storage';
import { authService } from '../services/auth';
import { userProfileService } from '../services/user';
import { sessionService } from '../services/session';
import { personalizationService } from '../services/personalization';
import { STORAGE_KEYS } from '../constants';

const AppContext = createContext(null);

const initialStats = {
  totalSessions: 0,
  totalAffirmations: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalTimeSeconds: 0,
  lastSessionDate: null,
  feelingsHistory: [],
};

const initialPreferences = {
  isPro: false,
  themeId: 'cosmic-purple',
  notificationsEnabled: false,
  notificationTime: '09:00',
  audioAutoPlay: false,
  preferredSessionLength: 3,
  repeatAffirmations: false,
};

export const AppProvider = ({ children }) => {
  const [stats, setStats] = useState(initialStats);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [favorites, setFavorites] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [unlockedThemes, setUnlockedThemes] = useState([]);

  useEffect(() => {
    loadAppData();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      if (newUser) {
        setHasCompletedOnboarding(true);
        // Reload data from Supabase when user logs in
        await loadSupabaseData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load data from Supabase (when authenticated)
  const loadSupabaseData = async () => {
    try {
      const [profile, notificationSettings, userFavorites, userSessions] = await Promise.all([
        userProfileService.getProfile(),
        userProfileService.getNotificationSettings(),
        userProfileService.getFavorites(),
        sessionService.getSessions({ limit: 100 }),
      ]);

      if (profile) {
        // Calculate actual total affirmations from session history
        const totalAffirmations = userSessions
          ? userSessions.reduce((sum, s) => sum + (s.promptsCompleted || 0), 0)
          : 0;

        // Get last session date from actual sessions, not login time
        const lastSessionDate = userSessions && userSessions.length > 0
          ? userSessions[0].createdAt
          : null;

        setStats({
          totalSessions: profile.totalSessions || 0,
          totalAffirmations,
          currentStreak: profile.currentStreak || 0,
          longestStreak: profile.longestStreak || 0,
          totalTimeSeconds: profile.totalTimeSeconds || 0,
          lastSessionDate,
          feelingsHistory: [],
        });

        setPreferences(prev => ({
          ...prev,
          isPro: profile.isPro || false,
          themeId: profile.themeId || 'cosmic-purple',
          preferredSessionLength: profile.preferredSessionLength || 3,
        }));

        // Check theme unlocks
        try {
          const themeUnlocks = await personalizationService.checkThemeUnlocks(profile.id);
          setUnlockedThemes(themeUnlocks);
        } catch (e) {
          console.log('Error checking theme unlocks:', e);
        }
      }

      if (notificationSettings) {
        setPreferences(prev => ({
          ...prev,
          notificationsEnabled: notificationSettings.enabled,
          notificationTime: notificationSettings.time,
        }));
      }

      if (userFavorites) {
        // Transform to match expected format
        setFavorites(userFavorites.map(fav => ({
          affirmationId: fav.id,
          ...fav,
        })));
      }

      if (userSessions) {
        setSessions(userSessions.map(s => ({
          id: s.id,
          feeling: s.feelingId,
          completedPrompts: s.promptsCompleted,
          duration: s.durationSeconds,
          date: s.createdAt,
        })));

        // Update feelings history from sessions
        const feelingsHistory = userSessions
          .filter(s => s.feelingId)
          .map(s => s.feelingId);
        setStats(prev => ({ ...prev, feelingsHistory }));
      }

      // Update last login
      await userProfileService.updateLastLogin();

      // Retroactively save pending first session (from guided onboarding)
      try {
        const pendingJson = await AsyncStorage.getItem(STORAGE_KEYS.pendingFirstSession);
        if (pendingJson) {
          const pending = JSON.parse(pendingJson);
          await sessionService.createSession({
            feelingId: null,
            durationSeconds: pending.durationSeconds || 0,
            promptsCompleted: pending.promptsCompleted || 1,
            timeOfDay: null,
            focusAreaId: null,
          });
          await AsyncStorage.removeItem(STORAGE_KEYS.pendingFirstSession);
        }
      } catch (pendingError) {
        // Non-critical — don't block app load if this fails
        console.log('Could not save pending first session:', pendingError);
      }
    } catch (error) {
      console.error('Error loading Supabase data:', error);
    }
  };

  // Load initial app data (local storage + check auth)
  const loadAppData = async () => {
    try {
      // Check if user is already authenticated
      const session = await authService.getSession();
      if (session?.user) {
        setUser(session.user);
        setHasCompletedOnboarding(true);
        await loadSupabaseData();
      } else {
        // Load from local storage for unauthenticated users
        const [loadedStats, loadedPrefs, loadedFavorites, loadedSessions, onboardingDone] = await Promise.all([
          storageService.getStats(),
          storageService.getPreferences(),
          storageService.getFavorites(),
          storageService.getSessions(),
          storageService.hasCompletedOnboarding(),
        ]);

        setStats(loadedStats);
        setPreferences(loadedPrefs);
        setFavorites(loadedFavorites);
        setSessions(loadedSessions);
        setHasCompletedOnboarding(false);
      }
    } catch (error) {
      console.error('Error loading app data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = useCallback(async (newStats) => {
    setStats(prev => {
      const updated = { ...prev, ...newStats };
      if (!user) {
        storageService.saveStats(updated);
      }
      return updated;
    });
  }, [user]);

  const updatePreferences = useCallback(async (newPrefs) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPrefs };
      if (!user) {
        storageService.savePreferences(updated);
      }
      return updated;
    });

    if (user) {
      try {
        if (newPrefs.themeId !== undefined || newPrefs.isPro !== undefined || newPrefs.preferredSessionLength !== undefined) {
          await userProfileService.updateProfile({
            themeId: newPrefs.themeId,
            isPro: newPrefs.isPro,
            preferredSessionLength: newPrefs.preferredSessionLength,
          });
        }
        if (newPrefs.notificationsEnabled !== undefined || newPrefs.notificationTime !== undefined) {
          await userProfileService.updateNotificationSettings({
            enabled: newPrefs.notificationsEnabled,
            time: newPrefs.notificationTime,
          });
        }
      } catch (error) {
        console.error('Error updating preferences in Supabase:', error);
      }
    }
  }, [user]);

  const addSession = useCallback(async (sessionData) => {
    if (user) {
      try {
        const session = await sessionService.createSession({
          feelingId: sessionData.feeling,
          durationSeconds: sessionData.duration || 0,
          promptsCompleted: sessionData.completedPrompts || 0,
          timeOfDay: sessionData.timeOfDay || null,
          focusAreaId: sessionData.focusAreaId || null,
          moodIntensity: sessionData.moodIntensity || null,
        });

        const transformedSession = {
          id: session.id,
          feeling: session.feelingId,
          completedPrompts: session.promptsCompleted,
          duration: session.durationSeconds,
          date: session.createdAt,
        };

        setSessions(prev => [...prev, transformedSession]);

        // Refresh stats after session
        const { currentStreak, longestStreak } = await sessionService.updateStreak();
        setStats(prev => ({
          ...prev,
          totalSessions: prev.totalSessions + 1,
          totalAffirmations: prev.totalAffirmations + (sessionData.completedPrompts || 0),
          totalTimeSeconds: prev.totalTimeSeconds + (sessionData.duration || 0),
          currentStreak,
          longestStreak,
          lastSessionDate: new Date().toISOString(),
          feelingsHistory: [...prev.feelingsHistory, sessionData.feeling],
        }));

        // Refresh theme unlocks after session (milestones may have been earned)
        try {
          const themeUnlocks = await personalizationService.checkThemeUnlocks(session.userId || user.id);
          setUnlockedThemes(themeUnlocks);
        } catch (e) {
          // Non-critical, continue
        }

        return transformedSession;
      } catch (error) {
        console.error('Error creating session in Supabase:', error);
        throw error;
      }
    } else {
      const newSession = await storageService.saveSession(sessionData);
      setSessions(prev => [...prev, newSession]);
      return newSession;
    }
  }, [user]);

  const completeOnboarding = useCallback(async () => {
    setHasCompletedOnboarding(true);
    await storageService.setOnboardingCompleted();
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
    setHasCompletedOnboarding(false);
    // Reset to initial state
    setStats(initialStats);
    setPreferences(initialPreferences);
    setFavorites([]);
    setSessions([]);
  }, []);

  const isPro = preferences.isPro;

  const refreshData = useCallback(async () => {
    if (user) {
      await loadSupabaseData();
    } else {
      await loadAppData();
    }
  }, [user]);

  const value = useMemo(() => ({
    stats,
    preferences,
    favorites,
    sessions,
    hasCompletedOnboarding,
    isLoading,
    isPro,
    user,
    unlockedThemes,
    updateStats,
    updatePreferences,
    addSession,
    setFavorites,
    completeOnboarding,
    signOut,
    refreshData,
  }), [
    stats, preferences, favorites, sessions, hasCompletedOnboarding,
    isLoading, isPro, user, unlockedThemes,
    updateStats, updatePreferences, addSession, completeOnboarding, signOut, refreshData,
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
