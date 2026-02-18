import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton, FloatingParticles } from '../components/common';
import { useApp } from '../context/AppContext';
import { useHaptics } from '../hooks/useHaptics';
import { useColors } from '../hooks/useColors';
import { typography } from '../styles/typography';
import { isToday } from '../utils/dateUtils';

const INHALE_DURATION = 3000;
const EXHALE_DURATION = 3000;

const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const WelcomeBackScreen = ({ navigation, route }) => {
  const { userName = 'Friend' } = route.params || {};
  const insets = useSafeAreaInsets();
  const { stats } = useApp();
  const { breathingPulse } = useHaptics();
  const c = useColors();

  const hasSessionToday = stats.lastSessionDate && isToday(stats.lastSessionDate);

  const [phase, setPhase] = useState('waiting');
  const [showActions, setShowActions] = useState(false);

  const circleScale = useSharedValue(0.6);
  const circleOpacity = useSharedValue(0);
  const actionsOpacity = useSharedValue(0);

  const hasNavigated = useRef(false);

  const handleGoHome = () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    navigation.replace('MainTabs');
  };

  const handleStartSession = () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    navigation.replace('MainTabs', {
      screen: 'AffirmTab',
      params: { screen: 'FocusSelection' },
    });
  };

  useEffect(() => {
    let cancelled = false;

    // 1.2s — Show breathing circle + begin inhale
    const breathStart = setTimeout(() => {
      if (cancelled) return;
      circleOpacity.value = withTiming(1, { duration: 500 });
      setPhase('inhale');
      breathingPulse();

      circleScale.value = withTiming(1.0, {
        duration: INHALE_DURATION,
        easing: Easing.inOut(Easing.ease),
      });
    }, 1200);

    // Exhale
    const exhaleStart = setTimeout(() => {
      if (cancelled) return;
      setPhase('exhale');
      circleScale.value = withTiming(0.6, {
        duration: EXHALE_DURATION,
        easing: Easing.inOut(Easing.ease),
      });
    }, 1200 + INHALE_DURATION);

    // Ready — show actions
    const readyStart = setTimeout(() => {
      if (cancelled) return;
      setPhase('ready');
      setShowActions(true);
      actionsOpacity.value = withTiming(1, { duration: 500 });
    }, 1200 + INHALE_DURATION + EXHALE_DURATION + 300);

    // Auto-navigate (only if already practiced today — mode B)
    let autoNav;
    if (hasSessionToday) {
      autoNav = setTimeout(() => {
        if (cancelled) return;
        handleGoHome();
      }, 10000);
    }

    return () => {
      cancelled = true;
      clearTimeout(breathStart);
      clearTimeout(exhaleStart);
      clearTimeout(readyStart);
      if (autoNav) clearTimeout(autoNav);
    };
  }, []);

  const circleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: circleOpacity.value,
  }));

  const actionsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: actionsOpacity.value,
  }));

  const phaseLabel = {
    waiting: '',
    inhale: 'Take a breath...',
    exhale: 'And let go...',
    ready: 'You\'re ready.',
  };

  const subtitle = hasSessionToday
    ? 'We\'ve been keeping your space warm.'
    : 'Your mirror is ready.';

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle={c.statusBarStyle} />
      <FloatingParticles count={8} opacity={0.06} />

      <View style={styles.content}>
        {/* Greeting */}
        <Animated.Text
          entering={FadeInDown.delay(300).duration(500)}
          style={[styles.greeting, { color: c.textPrimary }]}
        >
          Welcome home,{' '}
          <Text style={{ color: c.accentRust }}>{userName}</Text>.
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(600).duration(500)}
          style={[styles.subtitle, { color: c.textSecondary }]}
        >
          {subtitle}
        </Animated.Text>

        {/* Breathing circle */}
        <View style={styles.breathingSection}>
          <Animated.View
            style={[
              styles.breathingCircle,
              {
                backgroundColor: hexToRgba(c.accentRust, 0.12),
                borderColor: hexToRgba(c.accentRust, 0.3),
              },
              circleAnimatedStyle,
            ]}
          >
            <View
              style={[
                styles.breathingCircleInner,
                { backgroundColor: hexToRgba(c.accentRust, 0.08) },
              ]}
            >
              <Text style={[styles.phaseLabel, { color: c.accentRust }]}>
                {phaseLabel[phase]}
              </Text>
            </View>
          </Animated.View>
        </View>
      </View>

      {/* Actions — different per mode */}
      <Animated.View style={[styles.footer, actionsAnimatedStyle]}>
        {showActions && (
          <>
            {hasSessionToday ? (
              // Mode B: Already practiced — just continue home
              <PrimaryButton
                title="Continue"
                icon="arrow-forward"
                onPress={handleGoHome}
              />
            ) : (
              // Mode A: No session today — invite to practice
              <>
                <PrimaryButton
                  title="Begin today's session"
                  icon="play"
                  onPress={handleStartSession}
                />
                <Pressable
                  onPress={handleGoHome}
                  style={styles.secondaryAction}
                  accessibilityRole="button"
                  accessibilityLabel="Skip to home"
                >
                  <Text style={[styles.secondaryActionText, { color: c.textMuted }]}>
                    Not right now
                  </Text>
                </Pressable>
              </>
            )}
          </>
        )}
      </Animated.View>

      {/* Skip — always available */}
      <Pressable
        onPress={handleGoHome}
        style={[styles.skipButton, { bottom: insets.bottom + 16 }]}
        hitSlop={12}
      >
        <Text style={[styles.skipText, { color: c.textMuted }]}>Skip</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 80,
  },
  greeting: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: typography.fontSize.title,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 17,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 48,
  },
  breathingSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingCircleInner: {
    width: 168,
    height: 168,
    borderRadius: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseLabel: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    paddingTop: 12,
    alignItems: 'center',
  },
  secondaryAction: {
    marginTop: 16,
    paddingVertical: 8,
  },
  secondaryActionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  skipButton: {
    position: 'absolute',
    alignSelf: 'center',
    padding: 8,
  },
  skipText: {
    fontSize: 13,
    opacity: 0.6,
  },
});
