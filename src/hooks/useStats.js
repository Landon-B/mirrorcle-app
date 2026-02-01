import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { getToday, isToday, isYesterday } from '../utils/dateUtils';

export const useStats = () => {
  const { stats, updateStats, sessions, addSession } = useApp();

  const recordSession = useCallback(async (sessionData) => {
    const today = getToday();
    const { feeling, completedPrompts = 0, duration = 0 } = sessionData;

    // Add session to sessions list
    await addSession({
      feeling,
      completedPrompts,
      duration,
    });

    // Calculate new streak
    let newStreak = stats.currentStreak;
    const lastDate = stats.lastSessionDate?.split('T')[0];

    if (!lastDate || isYesterday(stats.lastSessionDate)) {
      // Continue or start streak
      newStreak = stats.currentStreak + 1;
    } else if (isToday(stats.lastSessionDate)) {
      // Same day, keep streak
      newStreak = stats.currentStreak;
    } else {
      // Streak broken, reset
      newStreak = 1;
    }

    // Update stats
    await updateStats({
      totalSessions: stats.totalSessions + 1,
      totalAffirmations: stats.totalAffirmations + completedPrompts,
      currentStreak: newStreak,
      lastSessionDate: new Date().toISOString(),
      feelingsHistory: [...stats.feelingsHistory, feeling],
    });

    return true;
  }, [stats, updateStats, addSession]);

  return {
    stats,
    sessions,
    recordSession,
    updateStats,
  };
};
