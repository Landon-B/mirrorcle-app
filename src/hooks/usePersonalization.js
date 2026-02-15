import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { personalizationService } from '../services/personalization';

export const usePersonalization = () => {
  const { stats, user } = useApp();
  const [milestones, setMilestones] = useState([]);
  const [powerPhrase, setPowerPhrase] = useState(null);
  const [growthNudge, setGrowthNudge] = useState(null);
  const [unlockedThemes, setUnlockedThemes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const timeOfDay = personalizationService.getTimeOfDay();
  const difficultyLevel = personalizationService.getDifficultyLevel(stats.totalSessions);
  const streakEncouragement = personalizationService.getStreakEncouragement(
    stats.currentStreak,
    stats.totalSessions
  );

  useEffect(() => {
    if (user?.id) {
      loadPersonalizationData();
    }
  }, [user?.id]);

  const loadPersonalizationData = async () => {
    if (!user?.id) return;

    try {
      const [milestonesData, phraseData, nudgeData, themeUnlocks] = await Promise.all([
        personalizationService.getUndismissedMilestones(user.id),
        personalizationService.getPowerPhrase(user.id),
        personalizationService.getGrowthNudge(user.id),
        personalizationService.checkThemeUnlocks(user.id),
      ]);

      setMilestones(milestonesData);
      setPowerPhrase(phraseData);
      setGrowthNudge(nudgeData);
      setUnlockedThemes(themeUnlocks);
    } catch (error) {
      console.error('Error loading personalization data:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const checkNewMilestones = useCallback(async () => {
    if (!user?.id) return [];
    try {
      const newMilestones = await personalizationService.checkMilestones(user.id);
      if (newMilestones.length > 0) {
        setMilestones(prev => [...newMilestones, ...prev]);
      }
      return newMilestones;
    } catch (error) {
      console.error('Error checking milestones:', error);
      return [];
    }
  }, [user?.id]);

  const dismissMilestone = useCallback(async (milestoneKey) => {
    if (!user?.id) return;
    try {
      await personalizationService.dismissMilestone(user.id, milestoneKey);
      setMilestones(prev => prev.filter(m => m.key !== milestoneKey));
    } catch (error) {
      console.error('Error dismissing milestone:', error);
    }
  }, [user?.id]);

  const getSessionComparison = useCallback(async (duration) => {
    if (!user?.id) return null;
    try {
      return await personalizationService.getSessionComparison(user.id, duration);
    } catch (error) {
      console.error('Error getting session comparison:', error);
      return null;
    }
  }, [user?.id]);

  const refreshData = useCallback(() => {
    return loadPersonalizationData();
  }, [user?.id]);

  return {
    streakEncouragement,
    milestones,
    powerPhrase,
    growthNudge,
    timeOfDay,
    difficultyLevel,
    unlockedThemes,
    isLoaded,
    checkNewMilestones,
    dismissMilestone,
    getSessionComparison,
    refreshData,
  };
};
