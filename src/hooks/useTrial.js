import { useState, useEffect, useCallback } from 'react';
import { trialService } from '../services/trial';
import { useApp } from '../context/AppContext';

/**
 * Hook for trial experience orchestration.
 * Provides trial status, day content, and auto-starts trial on first session.
 */
export const useTrial = () => {
  const { user, isPro, stats } = useApp();

  const [trialStatus, setTrialStatus] = useState({
    isInTrial: false,
    trialDay: 0,
    daysRemaining: 7,
    trialStartedAt: null,
    trialEndedAt: null,
    hasExpired: false,
    isPro: false,
  });
  const [dayContent, setDayContent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load trial status
  const loadStatus = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const status = await trialService.getTrialStatus();
      setTrialStatus(status);

      if (status.isInTrial && status.trialDay > 0) {
        const content = trialService.getTrialDayContent(status.trialDay);
        setDayContent(content);
      } else {
        setDayContent(null);
      }
    } catch (e) {
      console.error('Error loading trial status:', e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus, stats.totalSessions]);

  // Auto-start trial when user completes first session
  const ensureTrialStarted = useCallback(async () => {
    if (!user?.id || isPro || trialStatus.trialStartedAt) return;

    try {
      await trialService.startTrial();
      await loadStatus();
    } catch (e) {
      console.error('Error starting trial:', e);
    }
  }, [user?.id, isPro, trialStatus.trialStartedAt, loadStatus]);

  return {
    trialStatus,
    dayContent,
    loading,
    ensureTrialStarted,
    refreshTrial: loadStatus,
  };
};
