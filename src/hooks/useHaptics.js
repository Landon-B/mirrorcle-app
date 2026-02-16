import { Platform } from 'react-native';

let Haptics = null;
let isHapticsAvailable = false;

// expo-haptics requires a native build — gracefully degrade in Expo Go
try {
  Haptics = require('expo-haptics');
  isHapticsAvailable = Platform.OS !== 'web';
} catch (e) {
  isHapticsAvailable = false;
}

const safeHaptic = (fn) => {
  if (!isHapticsAvailable || !Haptics) return;
  try {
    fn();
  } catch (e) {
    // Silently fail — haptics not available in this environment
  }
};

export const useHaptics = () => {
  const selectionTap = () => {
    safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
  };

  const successPulse = () => {
    safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
  };

  const celebrationBurst = () => {
    safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    setTimeout(() => {
      safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
    }, 200);
  };

  const breathingPulse = () => {
    safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
  };

  return {
    selectionTap,
    successPulse,
    celebrationBurst,
    breathingPulse,
  };
};
