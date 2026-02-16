import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Personalized notification templates
const NOTIFICATION_TEMPLATES = {
  streakActive: (streak, name) => ({
    title: 'Keep Your Streak Going',
    body: name
      ? `Day ${streak + 1} awaits, ${name}. Keep your mirror momentum going.`
      : `Day ${streak + 1} awaits. Keep your mirror momentum going.`,
  }),
  streakAtRisk: (streak) => ({
    title: "Don't Break Your Streak",
    body: `Don't let your ${streak}-day streak slip. Your mirror is waiting.`,
  }),
  noStreak: () => ({
    title: 'Your Mirror Awaits',
    body: 'Your mirror is waiting. Take a moment for yourself today.',
  }),
  afterFeeling: (feeling) => ({
    title: 'Check In With Yourself',
    body: `Last time you felt ${feeling}. How are you today?`,
  }),
};

class NotificationServiceClass {
  async requestPermission() {
    if (!Device.isDevice) {
      console.log('Notifications require a physical device');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-reminder', {
        name: 'Daily Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    return true;
  }

  async getPermissionStatus() {
    const { status } = await Notifications.getPermissionsAsync();
    return { status };
  }

  /**
   * Schedule a personalized daily reminder
   * @param {string} time - Time in HH:MM format
   * @param {Object} context - Personalization context
   * @param {number} context.streak - Current streak
   * @param {string} context.lastFeeling - Last feeling selected
   * @param {string} context.userName - User's name
   */
  async scheduleDailyReminder(time = '09:00', context = {}) {
    const [hours, minutes] = time.split(':').map(Number);
    const { streak = 0, lastFeeling = null, userName = null } = context;

    // Cancel existing reminders first
    await this.cancelAllScheduled();

    // Choose template based on context
    let content;
    if (streak > 3) {
      content = NOTIFICATION_TEMPLATES.streakAtRisk(streak);
    } else if (streak > 0) {
      content = NOTIFICATION_TEMPLATES.streakActive(streak, userName);
    } else if (lastFeeling) {
      content = NOTIFICATION_TEMPLATES.afterFeeling(lastFeeling);
    } else {
      content = NOTIFICATION_TEMPLATES.noStreak();
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        ...content,
        data: { screen: 'FocusSelection' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });

    return true;
  }

  async cancelAllScheduled() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return true;
  }

  async getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  setupNotificationHandler(navigationRef) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Handle notification tap to navigate
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const screen = response.notification.request.content.data?.screen;
      if (screen && navigationRef?.current) {
        navigationRef.current.navigate(screen);
      }
    });

    return () => subscription.remove();
  }

  async sendTestNotification(context = {}) {
    const { streak = 0, lastFeeling = null, userName = null } = context;

    // Test notification always uses the personalized greeting
    const content = userName
      ? {
          title: `${userName}, your mirror is waiting`,
          body: streak > 0
            ? `Day ${streak + 1} of your journey. Take a moment to speak kindly to yourself today.`
            : 'Take a moment to speak kindly to yourself today.',
        }
      : NOTIFICATION_TEMPLATES.noStreak();

    await Notifications.scheduleNotificationAsync({
      content: {
        ...content,
        data: { screen: 'FocusSelection' },
        sound: true,
      },
      trigger: null,
    });

    return true;
  }

  async getExpoPushToken() {
    if (!Device.isDevice) return null;
    try {
      const { data } = await Notifications.getExpoPushTokenAsync();
      return data;
    } catch (error) {
      console.log('Error getting push token:', error);
      return null;
    }
  }
}

export const NotificationService = new NotificationServiceClass();
