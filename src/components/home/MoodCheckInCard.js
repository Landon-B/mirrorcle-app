import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { QUADRANTS, getMoodsForQuadrant, MOOD_RESPONSES } from '../../constants/feelings';
import { useHaptics } from '../../hooks/useHaptics';
import { typography } from '../../styles/typography';

const SERIF_ITALIC = Platform.OS === 'ios' ? 'Georgia-Italic' : 'serif';
const CIRCLE_SIZE = 56;
const BUBBLE_SIZE = 44;

/**
 * MoodCheckInCard — inline mood check-in on the HomeScreen.
 *
 * Two-phase interaction:
 * 1. Show 4 quadrant circles ("How are you feeling?")
 * 2. On quadrant tap → expand to show emotion bubbles for that quadrant
 * 3. On emotion select → record check-in, show thank-you, collapse
 *
 * No navigation away from HomeScreen.
 *
 * Props:
 * - reason: string — copy for the card heading (from useCheckIn)
 * - checkinStreak: number — for streak badge display
 * - onCheckIn: (feelingId, quadrantId) => Promise — callback to record check-in
 * - c: object — color tokens from useColors
 */
export const MoodCheckInCard = ({ reason, checkinStreak, onCheckIn, c }) => {
  const [selectedQuadrant, setSelectedQuadrant] = useState(null);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const { selectionTap, successPulse, breathingPulse } = useHaptics();

  // Expand animation for emotion bubbles
  const expandProgress = useSharedValue(0);

  const expandStyle = useAnimatedStyle(() => ({
    maxHeight: expandProgress.value * 200,
    opacity: expandProgress.value,
    transform: [{ translateY: (1 - expandProgress.value) * -10 }],
  }));

  const handleQuadrantSelect = useCallback((quadrantId) => {
    selectionTap();
    setSelectedQuadrant(quadrantId);
    expandProgress.value = withSpring(1, { damping: 18, stiffness: 160 });
  }, [selectionTap, expandProgress]);

  const handleEmotionSelect = useCallback(async (mood) => {
    if (isRecording) return;
    setIsRecording(true);
    breathingPulse();
    setSelectedEmotion(mood.id);

    try {
      await onCheckIn(mood.id, selectedQuadrant);
      successPulse();
    } catch (e) {
      console.error('Check-in failed:', e);
    }

    // Brief pause to show validation, then mark complete
    setTimeout(() => {
      setIsComplete(true);
    }, 1800);
  }, [selectedQuadrant, onCheckIn, isRecording, breathingPulse, successPulse]);

  // --- Complete state ---
  if (isComplete) {
    return (
      <Animated.View
        entering={FadeIn.duration(400)}
        exiting={FadeOut.duration(500).delay(1500)}
        style={[styles.completeCard, { backgroundColor: c.surfaceSecondary }]}
      >
        <View style={styles.completeContent}>
          <Ionicons name="checkmark-circle" size={24} color={c.accentRust} />
          <Text style={[styles.completeText, { color: c.textPrimary }]}>
            Thanks for checking in.
          </Text>
        </View>
        {checkinStreak > 0 && (
          <Text style={[styles.streakBadge, { color: c.accentRust }]}>
            {checkinStreak} day check-in flow
          </Text>
        )}
      </Animated.View>
    );
  }

  // --- Emotion selected state (brief validation) ---
  if (selectedEmotion) {
    const validationText = MOOD_RESPONSES[selectedEmotion] || 'Thank you for noticing.';
    return (
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[styles.card, { backgroundColor: c.surface, shadowColor: c.cardShadow }]}
      >
        <Text style={[styles.validationText, { color: c.accentRust }]}>
          {validationText}
        </Text>
      </Animated.View>
    );
  }

  // --- Main card ---
  const emotionsForQuadrant = selectedQuadrant ? getMoodsForQuadrant(selectedQuadrant) : [];
  const activeQuadrant = selectedQuadrant ? QUADRANTS.find(q => q.id === selectedQuadrant) : null;

  return (
    <Animated.View
      entering={FadeInDown.duration(500)}
      style={[styles.card, { backgroundColor: c.surface, shadowColor: c.cardShadow }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: c.surfaceSecondary }]}>
          <Ionicons name="heart-circle" size={20} color={c.accentRust} />
        </View>
        <Text style={[styles.headerText, { color: c.textPrimary }]}>
          {reason || 'How are you feeling?'}
        </Text>
      </View>

      {/* Quadrant circles */}
      <View style={styles.quadrantRow}>
        {QUADRANTS.map((q) => {
          const isSelected = selectedQuadrant === q.id;
          const isDimmed = selectedQuadrant && !isSelected;

          return (
            <Pressable
              key={q.id}
              onPress={() => handleQuadrantSelect(q.id)}
              accessibilityRole="button"
              accessibilityLabel={`${q.label} — ${q.description}`}
            >
              <View
                style={[
                  styles.circleOuter,
                  {
                    borderColor: isSelected ? q.colorDark : 'transparent',
                    borderWidth: isSelected ? 2.5 : 0,
                    opacity: isDimmed ? 0.3 : 1,
                    transform: [{ scale: isSelected ? 1.1 : (isDimmed ? 0.88 : 1) }],
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
      </View>

      {/* Expanded emotion bubbles */}
      {selectedQuadrant && (
        <Animated.View style={[styles.emotionSection, expandStyle]}>
          <Text style={[styles.emotionPrompt, { color: c.textSecondary }]}>
            {activeQuadrant?.description || 'What fits closest?'}
          </Text>
          <View style={styles.emotionGrid}>
            {emotionsForQuadrant.map((mood) => (
              <Pressable
                key={mood.id}
                onPress={() => handleEmotionSelect(mood)}
                style={[
                  styles.emotionBubble,
                  { backgroundColor: c.surfaceSecondary, borderColor: c.border },
                ]}
              >
                <Text style={styles.emotionEmoji}>{mood.emoji}</Text>
                <Text style={[styles.emotionLabel, { color: c.textPrimary }]} numberOfLines={1}>
                  {mood.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Streak badge */}
      {checkinStreak > 0 && !selectedQuadrant && (
        <View style={styles.streakRow}>
          <Ionicons name="flame" size={12} color={c.accentRust} />
          <Text style={[styles.streakText, { color: c.accentRust }]}>
            {checkinStreak} day check-in flow
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },

  // Quadrant circles
  quadrantRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 8,
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
    fontSize: 10,
    textAlign: 'center',
    marginTop: 6,
  },
  circleLabelSelected: {
    fontWeight: '600',
  },

  // Emotion bubbles (expanded)
  emotionSection: {
    overflow: 'hidden',
    marginTop: 12,
  },
  emotionPrompt: {
    fontSize: 13,
    fontFamily: SERIF_ITALIC,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 12,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  emotionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  emotionEmoji: {
    fontSize: 16,
  },
  emotionLabel: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Validation state
  validationText: {
    fontFamily: SERIF_ITALIC,
    fontStyle: 'italic',
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
    paddingVertical: 8,
  },

  // Complete state
  completeCard: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 20,
    alignItems: 'center',
  },
  completeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completeText: {
    fontSize: 15,
    fontWeight: '500',
  },
  streakBadge: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 6,
  },

  // Streak row (in main card)
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
