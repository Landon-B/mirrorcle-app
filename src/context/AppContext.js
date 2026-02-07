import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storage';
import { authService } from '../services/auth';

const AppContext = createContext(null);

const initialStats = {
  totalSessions: 0,
  totalAffirmations: 0,
  currentStreak: 0,
  lastSessionDate: null,
  feelingsHistory: [],
};

const initialPreferences = {
  isPro: false,
  themeId: 'cosmic-purple',
  notificationsEnabled: false,
  notificationTime: '09:00',
  audioAutoPlay: false,
};

export const AppProvider = ({ children }) => {
  const [stats, setStats] = useState(initialStats);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [favorites, setFavorites] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadAppData();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setHasCompletedOnboarding(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadAppData = async () => {
    try {
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
      // For testing: always show login/signup flow
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('Error loading app data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = useCallback(async (newStats) => {
    const updated = { ...stats, ...newStats };
    setStats(updated);
    await storageService.saveStats(updated);
  }, [stats]);

  const updatePreferences = useCallback(async (newPrefs) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    await storageService.savePreferences(updated);
  }, [preferences]);

  const addSession = useCallback(async (sessionData) => {
    const newSession = await storageService.saveSession(sessionData);
    setSessions(prev => [...prev, newSession]);
    return newSession;
  }, []);

  const completeOnboarding = useCallback(async () => {
    setHasCompletedOnboarding(true);
    await storageService.setOnboardingCompleted();
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
    setHasCompletedOnboarding(false);
  }, []);

  const value = {
    // State
    stats,
    preferences,
    favorites,
    sessions,
    hasCompletedOnboarding,
    isLoading,
    isPro: preferences.isPro,
    user,

    // Actions
    updateStats,
    updatePreferences,
    addSession,
    setFavorites,
    completeOnboarding,
    signOut,
    refreshData: loadAppData,
  };

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
