import { useState, useEffect, useCallback, useRef } from 'react';
import { checkInService } from '../services/checkin';

/**
 * Hook for smart check-in system.
 *
 * Provides:
 * - checkInType: What the HomeScreen card should show ('full' | 'none')
 * - sessionEntryType: How to route session entry ('full' | 'quick')
 * - checkinStreak: Consecutive days with standalone check-ins
 * - hasCheckedInToday: Whether user has done any check-in today
 * - recordCheckIn: Function to record a standalone check-in
 * - baseline: Emotional baseline data for Growth Dashboard
 * - baselineLoading: Whether baseline is being computed
 * - refreshStatus: Force refresh check-in status
 */
export function useCheckIn() {
  const [checkInType, setCheckInType] = useState('none');
  const [checkInReason, setCheckInReason] = useState('');
  const [sessionEntryType, setSessionEntryType] = useState('full');
  const [checkinStreak, setCheckinStreak] = useState(0);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [baseline, setBaseline] = useState(null);
  const [baselineLoading, setBaselineLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);

  // Cache baseline for 5 minutes
  const baselineCacheRef = useRef({ data: null, timestamp: 0 });
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Load check-in status on mount
  const refreshStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      // Resolve home card type
      const homeResult = await checkInService.resolveCheckInType('home_card');
      setCheckInType(homeResult.type);
      setCheckInReason(homeResult.reason);

      // Resolve session entry type
      const sessionResult = await checkInService.resolveCheckInType('session_entry');
      setSessionEntryType(sessionResult.type);

      // Get status for streak + hasCheckedInToday
      const status = await checkInService.getCheckInStatus();
      setCheckinStreak(status.checkinStreak);
      setHasCheckedInToday(status.hasCheckedInToday);
    } catch (error) {
      console.error('Error loading check-in status:', error);
      // Defaults are safe (show full check-in)
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Record a standalone check-in
  const recordCheckIn = useCallback(async (feelingId = null, quadrantId = null, moodType = 'checkin') => {
    try {
      await checkInService.recordCheckIn(feelingId, quadrantId, moodType);

      // Refresh status after recording
      await refreshStatus();

      // Invalidate baseline cache
      baselineCacheRef.current = { data: null, timestamp: 0 };

      return true;
    } catch (error) {
      console.error('Error recording check-in:', error);
      return false;
    }
  }, [refreshStatus]);

  // Load baseline (with caching)
  const loadBaseline = useCallback(async (forceRefresh = false) => {
    const cache = baselineCacheRef.current;
    const now = Date.now();

    if (!forceRefresh && cache.data && (now - cache.timestamp) < CACHE_TTL) {
      setBaseline(cache.data);
      return cache.data;
    }

    setBaselineLoading(true);
    try {
      const data = await checkInService.computeEmotionalBaseline(12);
      baselineCacheRef.current = { data, timestamp: now };
      setBaseline(data);
      return data;
    } catch (error) {
      console.error('Error computing baseline:', error);
      return null;
    } finally {
      setBaselineLoading(false);
    }
  }, []);

  return {
    // HomeScreen card
    checkInType,
    checkInReason,

    // Session entry routing
    sessionEntryType,

    // Status
    checkinStreak,
    hasCheckedInToday,
    statusLoading,

    // Actions
    recordCheckIn,
    refreshStatus,

    // Baseline analytics
    baseline,
    baselineLoading,
    loadBaseline,
  };
}
