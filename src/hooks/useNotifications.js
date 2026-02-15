import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { NotificationService } from '../services/notifications';

export const useNotifications = () => {
  const { preferences, updatePreferences, stats, user } = useApp();
  const [permissionStatus, setPermissionStatus] = useState('undetermined');
  const scheduleTimerRef = useRef(null);
  const statsRef = useRef(stats);

  const isEnabled = preferences.notificationsEnabled;
  const notificationTime = preferences.notificationTime;

  // Keep stats ref current for use in callbacks without re-creating them
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    checkPermission();
  }, []);

  // Reschedule when context changes, debounced to prevent rapid-fire calls
  useEffect(() => {
    if (isEnabled) {
      if (scheduleTimerRef.current) {
        clearTimeout(scheduleTimerRef.current);
      }
      scheduleTimerRef.current = setTimeout(() => {
        scheduleWithContext();
      }, 500);
    }
    return () => {
      if (scheduleTimerRef.current) {
        clearTimeout(scheduleTimerRef.current);
      }
    };
  }, [stats.currentStreak, stats.feelingsHistory.length]);

  const checkPermission = async () => {
    try {
      const { status } = await NotificationService.getPermissionStatus();
      setPermissionStatus(status);
    } catch (error) {
      console.log('Error checking notification permission:', error);
    }
  };

  const getNotificationContext = () => {
    const currentStats = statsRef.current;
    const lastFeeling = currentStats.feelingsHistory.length > 0
      ? currentStats.feelingsHistory[currentStats.feelingsHistory.length - 1]
      : null;

    return {
      streak: currentStats.currentStreak,
      lastFeeling,
      userName: user?.user_metadata?.name || null,
    };
  };

  const scheduleWithContext = async () => {
    try {
      await NotificationService.scheduleDailyReminder(
        notificationTime,
        getNotificationContext()
      );
    } catch (error) {
      console.log('Error scheduling notification:', error);
    }
  };

  const requestPermission = useCallback(async () => {
    try {
      const granted = await NotificationService.requestPermission();
      setPermissionStatus(granted ? 'granted' : 'denied');
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  const enableNotifications = useCallback(async (time = '09:00') => {
    const granted = await requestPermission();
    if (granted) {
      await updatePreferences({
        notificationsEnabled: true,
        notificationTime: time,
      });
      await NotificationService.scheduleDailyReminder(time, getNotificationContext());
    }
    return granted;
  }, [requestPermission, updatePreferences]);

  const disableNotifications = useCallback(async () => {
    await updatePreferences({ notificationsEnabled: false });
    await NotificationService.cancelAllScheduled();
  }, [updatePreferences]);

  const updateNotificationTime = useCallback(async (time) => {
    await updatePreferences({ notificationTime: time });
    if (isEnabled) {
      await NotificationService.scheduleDailyReminder(time, getNotificationContext());
    }
  }, [updatePreferences, isEnabled]);

  const sendTestNotification = useCallback(async () => {
    await NotificationService.sendTestNotification(getNotificationContext());
  }, []);

  return {
    isEnabled,
    notificationTime,
    permissionStatus,
    enableNotifications,
    disableNotifications,
    updateNotificationTime,
    sendTestNotification,
  };
};
