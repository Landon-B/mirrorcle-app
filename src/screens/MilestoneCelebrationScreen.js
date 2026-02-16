import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withRepeat,
  withSequence,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { PrimaryButton, FloatingParticles } from '../components/common';
import { typography } from '../styles/typography';
import { shadows } from '../styles/spacing';
import { useHaptics } from '../hooks/useHaptics';

const MILESTONE_CONFIG = {
  first_session: {
    icon: 'sparkles',
    title: 'First Step Taken',
    message: 'You just did something most people never will \u2014 you looked at yourself and spoke truth. This is your beginning.',
  },
  ten_sessions: {
    icon: 'flame',
    title: 'Finding Your Voice',
    message: 'Ten sessions of showing up for yourself. You\u2019re not just trying anymore \u2014 you\u2019re practicing.',
  },
  fifty_sessions: {
    icon: 'trophy',
    title: 'Dedicated Practitioner',
    message: 'Fifty times you chose yourself. That kind of dedication doesn\u2019t just build a habit \u2014 it builds a person.',
  },
  hundred_affirmations: {
    icon: 'diamond',
    title: 'Words of Power',
    message: 'One hundred truths spoken aloud. Each one a seed planted in the soil of who you\u2019re becoming.',
  },
  seven_day_streak: {
    icon: 'calendar',
    title: 'One Week Strong',
    message: 'Seven days in a row of choosing yourself. Your mirror is becoming a sanctuary.',
  },
  thirty_day_streak: {
    icon: 'medal',
    title: 'Look At You Now',
    message: '30 days ago, you chose yourself for the first time. Look at you now \u2014 this practice is part of who you are.',
  },
  first_favorite: {
    icon: 'heart',
    title: 'Found Your Words',
    message: 'You saved the words that moved you. Return to them whenever you need a reminder of your truth.',
  },
  all_feelings_explored: {
    icon: 'color-palette',
    title: 'Emotional Explorer',
    message: 'You\u2019ve met every part of yourself in the mirror. That kind of self-awareness is a superpower.',
  },
  custom_affirmation_created: {
    icon: 'create',
    title: 'Your Own Words',
    message: 'You found the words that no one else could give you. No one knows what you need to hear better than you.',
  },
};

const DEFAULT_MILESTONE = {
  icon: 'star',
  title: 'Achievement Unlocked',
  message: 'You reached a new milestone on your journey of self-reflection.',
};

const BadgeIcon = ({ icon }) => {
  const scale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      500,
      withSpring(1, { damping: 10, stiffness: 80 })
    );
    glowOpacity.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1200 }),
          withTiming(0.2, { duration: 1200 })
        ),
        -1,
        true
      )
    );
  }, []);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.badgeWrapper}>
      <Animated.View style={[styles.glowRing, glowStyle]} />
      <Animated.View style={[styles.iconCircle, badgeStyle]}>
        <Ionicons name={icon} size={36} color="#C17666" />
      </Animated.View>
    </View>
  );
};

export const MilestoneCelebrationScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { milestoneKey, themeUnlocked, fromSession } = route.params || {};
  const { celebrationBurst } = useHaptics();

  const config = MILESTONE_CONFIG[milestoneKey] || DEFAULT_MILESTONE;

  useEffect(() => {
    celebrationBurst();
  }, []);

  const handleDismiss = () => {
    if (fromSession) {
      // Navigate home instead of going back to SuccessCelebration
      navigation.navigate('MainTabs', { screen: 'HomeTab', params: { screen: 'Home' } });
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      <FloatingParticles count={16} opacity={0.35} />

      <View style={styles.content}>
        <BadgeIcon icon={config.icon} />

        <Animated.Text
          entering={FadeInDown.delay(800).springify().damping(12)}
          style={styles.title}
        >
          {config.title}
        </Animated.Text>

        <Animated.Text
          entering={FadeIn.delay(1200).duration(600)}
          style={styles.message}
        >
          {config.message}
        </Animated.Text>

        {themeUnlocked && (
          <Animated.View
            entering={FadeInUp.delay(1600).duration(500)}
            style={styles.unlockBadge}
          >
            <Ionicons name="color-palette" size={16} color="#C17666" />
            <Text style={styles.unlockText}>
              New theme unlocked: {themeUnlocked}
            </Text>
          </Animated.View>
        )}
      </View>

      <Animated.View
        entering={FadeIn.delay(2000).duration(400)}
        style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}
      >
        <PrimaryButton
          title="Keep Going"
          icon="arrow-forward"
          onPress={handleDismiss}
        />

        <Pressable onPress={handleDismiss} style={styles.dismissButton}>
          <Text style={styles.dismissText}>DISMISS</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2EE',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  badgeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    width: 100,
    height: 100,
  },
  glowRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8D0C6',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8D0C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2A26',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 17,
    fontStyle: 'italic',
    color: '#7A756E',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  unlockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginTop: 28,
    gap: 8,
    ...shadows.card,
  },
  unlockText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C17666',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: 'center',
  },
  dismissButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  dismissText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#B0AAA2',
  },
});
