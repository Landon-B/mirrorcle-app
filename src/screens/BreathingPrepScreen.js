import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { AFFIRMATIONS, FALLBACK_AFFIRMATIONS } from '../constants';
import { ScreenHeader, PrimaryButton } from '../components/common';
import { typography } from '../styles/typography';
import { shadows } from '../styles/spacing';
import { useHaptics } from '../hooks/useHaptics';
import { useColors } from '../hooks/useColors';

const INHALE_DURATION = 4000;
const HOLD_DURATION = 2000;
const EXHALE_DURATION = 4000;
const BREATH_CYCLE = INHALE_DURATION + HOLD_DURATION + EXHALE_DURATION; // 10s
const TOTAL_BREATHS = 3;

const PHASE_LABELS = {
  inhale: 'Breathe in...',
  hold: 'Hold...',
  exhale: 'Breathe out...',
};

// Helper to convert hex color to rgba string
const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const BreathingPrepScreen = ({ navigation, route }) => {
  const { focusArea, mood } = route.params || {};
  const { breathingPulse } = useHaptics();
  const c = useColors();

  const [breathPhase, setBreathPhase] = useState('inhale');
  const [currentBreath, setCurrentBreath] = useState(0);
  const [breathingComplete, setBreathingComplete] = useState(false);
  const [isBreathing, setIsBreathing] = useState(true);

  const circleScale = useSharedValue(0.6);
  const circleOpacity = useSharedValue(0.4);
  const labelOpacity = useSharedValue(1);
  const buttonOpacity = useSharedValue(0);

  const previewAffirmation = useMemo(() => {
    if (AFFIRMATIONS && AFFIRMATIONS.length > 0) {
      const randomIndex = Math.floor(Math.random() * AFFIRMATIONS.length);
      return AFFIRMATIONS[randomIndex].text;
    }
    const randomIndex = Math.floor(Math.random() * FALLBACK_AFFIRMATIONS.length);
    return FALLBACK_AFFIRMATIONS[randomIndex];
  }, []);

  const onPhaseChange = useCallback((phase) => {
    setBreathPhase(phase);
    if (phase === 'inhale') {
      breathingPulse();
    }
  }, [breathingPulse]);

  const onBreathComplete = useCallback((breathNum) => {
    setCurrentBreath(breathNum);
  }, []);

  const onAllBreathsComplete = useCallback(() => {
    setBreathingComplete(true);
    setIsBreathing(false);
    buttonOpacity.value = withTiming(1, { duration: 500 });
  }, [buttonOpacity]);

  // Run breathing animation cycle
  useEffect(() => {
    if (!isBreathing) return;

    let breathCount = 0;
    let cancelled = false;

    const runCycle = () => {
      if (cancelled) return;

      // Inhale
      runOnJS(onPhaseChange)('inhale');
      circleScale.value = withTiming(1.0, {
        duration: INHALE_DURATION,
        easing: Easing.inOut(Easing.ease),
      });
      circleOpacity.value = withTiming(0.8, {
        duration: INHALE_DURATION,
        easing: Easing.inOut(Easing.ease),
      });

      // Hold
      setTimeout(() => {
        if (cancelled) return;
        runOnJS(onPhaseChange)('hold');
      }, INHALE_DURATION);

      // Exhale
      setTimeout(() => {
        if (cancelled) return;
        runOnJS(onPhaseChange)('exhale');
        circleScale.value = withTiming(0.6, {
          duration: EXHALE_DURATION,
          easing: Easing.inOut(Easing.ease),
        });
        circleOpacity.value = withTiming(0.4, {
          duration: EXHALE_DURATION,
          easing: Easing.inOut(Easing.ease),
        });
      }, INHALE_DURATION + HOLD_DURATION);

      // Next cycle or complete
      setTimeout(() => {
        if (cancelled) return;
        breathCount++;
        runOnJS(onBreathComplete)(breathCount);
        if (breathCount < TOTAL_BREATHS) {
          runCycle();
        } else {
          runOnJS(onAllBreathsComplete)();
        }
      }, BREATH_CYCLE);
    };

    // Small delay before starting
    const startTimer = setTimeout(runCycle, 500);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
    };
  }, [isBreathing]);

  const handleSkip = () => {
    setIsBreathing(false);
    setBreathingComplete(true);
    buttonOpacity.value = withTiming(1, { duration: 300 });
  };

  const handleReady = () => {
    navigation.navigate('Session', {
      focusArea,
      mood,
      firstAffirmation: previewAffirmation,
    });
  };

  const circleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: circleOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScreenHeader
        label="PREPARATION"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Focus area pill */}
        {focusArea && (
          <View style={[styles.focusPill, { backgroundColor: c.surface }]}>
            <Text style={styles.focusPillEmoji}>{focusArea.emoji}</Text>
            <Text style={[styles.focusPillText, { color: c.accentRust }]}>{focusArea.label}</Text>
          </View>
        )}

        {/* Breathing section */}
        <View style={styles.breathingSection}>
          <Animated.View style={[
            styles.breathingCircle,
            {
              backgroundColor: hexToRgba(c.accentRust, 0.12),
              borderColor: hexToRgba(c.accentRust, 0.3),
            },
            circleAnimatedStyle,
          ]}>
            <View style={[
              styles.breathingCircleInner,
              { backgroundColor: hexToRgba(c.accentRust, 0.08) },
            ]}>
              <Text style={[styles.breathingPhaseLabel, { color: c.accentRust }]}>
                {isBreathing ? PHASE_LABELS[breathPhase] : 'You are ready.'}
              </Text>
            </View>
          </Animated.View>

          {/* Progress dots */}
          <View style={styles.progressDots}>
            {Array.from({ length: TOTAL_BREATHS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  { backgroundColor: c.accentPeach },
                  i < currentBreath && { backgroundColor: c.accentRust },
                  i === currentBreath && isBreathing && { backgroundColor: c.feelingPink },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Affirmation preview card */}
        <View style={[styles.affirmationCard, { backgroundColor: c.surface }]}>
          <View style={styles.quoteMarkContainer}>
            <Text style={[styles.quoteMark, { color: c.accentPeach }]}>{'\u201C'}</Text>
          </View>
          <Text style={[styles.affirmationText, { color: c.textPrimary }]}>
            {previewAffirmation}
          </Text>
          <View style={styles.quoteMarkContainerEnd}>
            <Text style={[styles.quoteMark, { color: c.accentPeach }]}>{'\u201D'}</Text>
          </View>
        </View>

        <View style={styles.spacer} />

        {/* Skip link (only during breathing) */}
        {isBreathing && (
          <Pressable onPress={handleSkip} hitSlop={12}>
            <Text style={[styles.skipText, { color: c.textMuted }]}>Skip</Text>
          </Pressable>
        )}
      </View>

      {/* Ready button (fades in after breathing) */}
      <Animated.View style={[styles.footer, buttonAnimatedStyle]}>
        {breathingComplete && (
          <PrimaryButton
            title="I am ready"
            icon="arrow-forward"
            onPress={handleReady}
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  focusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
    ...shadows.card,
  },
  focusPillEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  focusPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  breathingSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  breathingCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingCircleInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingPhaseLabel: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  affirmationCard: {
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 28,
    width: '100%',
    alignItems: 'center',
    ...shadows.cardLifted,
  },
  quoteMarkContainer: {
    alignSelf: 'flex-start',
    marginBottom: -4,
  },
  quoteMarkContainerEnd: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  quoteMark: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 36,
    lineHeight: 40,
  },
  affirmationText: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 22,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 32,
    paddingHorizontal: 8,
  },
  spacer: {
    flex: 1,
  },
  skipText: {
    fontSize: 14,
    marginBottom: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
});
