import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const isHapticsAvailable = Platform.OS !== 'web';

export const useHaptics = () => {
  const selectionTap = () => {
    if (isHapticsAvailable) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const successPulse = () => {
    if (isHapticsAvailable) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const celebrationBurst = () => {
    if (isHapticsAvailable) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 200);
    }
  };

  const breathingPulse = () => {
    if (isHapticsAvailable) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return {
    selectionTap,
    successPulse,
    celebrationBurst,
    breathingPulse,
  };
};
