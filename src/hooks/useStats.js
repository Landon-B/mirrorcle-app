import { useCallback } from 'react';
import { useApp } from '../context/AppContext';

export const useStats = () => {
  const { stats, updateStats, sessions, addSession } = useApp();

  const recordSession = useCallback(async (sessionData) => {
    const { feeling, completedPrompts = 0, duration = 0, timeOfDay, focusAreaId, moodIntensity } = sessionData;

    // addSession handles all stat updates (totalSessions, totalAffirmations,
    // streak, lastSessionDate, feelingsHistory) via Supabase + setState
    const session = await addSession({
      feeling,
      completedPrompts,
      duration,
      timeOfDay,
      focusAreaId,
      moodIntensity,
    });

    return session;
  }, [addSession]);

  return {
    stats,
    sessions,
    recordSession,
    updateStats,
  };
};
