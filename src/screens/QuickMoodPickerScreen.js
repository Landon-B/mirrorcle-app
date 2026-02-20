import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { QUADRANTS } from '../constants/feelings';
import { ScreenHeader } from '../components/common';
import { sessionService } from '../services/session';
import { useHaptics } from '../hooks/useHaptics';
import { useColors } from '../hooks/useColors';

/**
 * QuickMoodPickerScreen — ultra-lightweight mood capture for repeat sessions.
 *
 * Shown when the user has already done a full mood check-in today.
 * Single tap on a quadrant → records quadrant-level pre-mood → navigates to Session.
 * Skip link → goes straight to Session with no mood data.
 *
 * ~3 seconds total interaction time.
 */

// Map quadrant selections to representative mood IDs (same as PostMoodReflectionScreen)
const QUADRANT_MOOD_MAP = {
  bright: 'energized',
  charged: 'restless',
  tender: 'calm',
  deep: 'melancholy',
};

const CIRCLE_SIZE = 72;

export const QuickMoodPickerScreen = ({ navigation, route }) => {
  const { focusArea } = route.params || {};
  const { breathingPulse } = useHaptics();
  const c = useColors();
  const [selected, setSelected] = useState(null);

  const handleSelect = async (quadrantId) => {
    if (selected) return; // Prevent double-tap
    setSelected(quadrantId);
    breathingPulse();

    const moodId = QUADRANT_MOOD_MAP[quadrantId];

    // Record as a quick pre-session mood (non-blocking, best-effort)
    // We pass mood ID so it integrates with existing mood history
    // The session will still record this as a pre-mood via createSession

    // Short delay for visual feedback, then navigate
    setTimeout(() => {
      navigation.navigate('Session', {
        focusArea,
        mood: { id: moodId, quadrant: quadrantId },
        quickEntry: true,
      });
    }, 300);
  };

  const handleSkip = () => {
    navigation.navigate('Session', {
      focusArea,
      mood: null,
      quickEntry: true,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScreenHeader
        label="QUICK CHECK"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.body}>
        <View style={styles.spacer} />

        {/* Heading */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(80)}
          style={styles.headingContainer}
        >
          <Text style={[styles.heading, { color: c.textPrimary }]}>
            Quick check —{'\n'}how are you?
          </Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>
            One tap to begin.
          </Text>
        </Animated.View>

        {/* Quadrant circles */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(200).springify().damping(16)}
          style={styles.quadrantRow}
        >
          {QUADRANTS.map((q) => {
            const isSelected = selected === q.id;
            const isDimmed = selected && !isSelected;

            return (
              <Pressable
                key={q.id}
                onPress={() => handleSelect(q.id)}
                accessibilityRole="button"
                accessibilityLabel={`${q.label} — ${q.description}`}
                accessibilityState={{ selected: isSelected }}
              >
                <View
                  style={[
                    styles.circleOuter,
                    {
                      borderColor: isSelected ? q.colorDark : 'transparent',
                      borderWidth: isSelected ? 3 : 0,
                      opacity: isDimmed ? 0.35 : 1,
                      transform: [{ scale: isSelected ? 1.12 : (isDimmed ? 0.9 : 1) }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[q.colorLight, q.colorPrimary]}
                    start={{ x: 0.2, y: 0 }}
                    end={{ x: 0.8, y: 1 }}
                    style={styles.circleGradient}
                  />
                </View>
                <Text
                  style={[
                    styles.circleLabel,
                    { color: isSelected ? q.colorDark : c.textMuted },
                    isSelected && styles.circleLabelSelected,
                  ]}
                >
                  {q.label}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>

        <View style={styles.spacer} />

        {/* Skip link */}
        <Animated.View entering={FadeIn.duration(300).delay(400)}>
          <Pressable onPress={handleSkip} hitSlop={12} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: c.textMuted }]}>SKIP</Text>
          </Pressable>
        </Animated.View>

        <View style={styles.bottomPadding} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
  headingContainer: {
    paddingHorizontal: 20,
    marginBottom: 36,
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  quadrantRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    paddingHorizontal: 20,
  },
  circleOuter: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: CIRCLE_SIZE / 2,
  },
  circleLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  circleLabelSelected: {
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    marginBottom: 8,
  },
  skipText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  bottomPadding: {
    height: 36,
  },
});
