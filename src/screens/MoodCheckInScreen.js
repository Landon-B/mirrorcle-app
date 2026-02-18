import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
} from 'react-native-reanimated';
import {
  MOODS,
  QUADRANTS,
  getMoodsForQuadrant,
  getQuadrantById,
  MOOD_RESPONSES,
  POST_MOOD_RESPONSES,
} from '../constants/feelings';
import { ScreenHeader, PrimaryButton } from '../components/common';
import { QuadrantGrid } from '../components/mood/QuadrantGrid';
import { BubbleCloud } from '../components/mood/BubbleCloud';
import { EmotionBottomSheet } from '../components/mood/EmotionBottomSheet';
import { BubbleSearchOverlay } from '../components/mood/BubbleSearchOverlay';
import { useHaptics } from '../hooks/useHaptics';
import { useColors } from '../hooks/useColors';

// Re-export for backward compat (PostMoodReflectionScreen imports this)
export { MOOD_RESPONSES, POST_MOOD_RESPONSES } from '../constants/feelings';

export const MoodCheckInScreen = ({ navigation, route }) => {
  const { mode = 'pre-session', focusArea, ...sessionData } = route.params || {};
  const { selectionTap, successPulse, breathingPulse } = useHaptics();
  const c = useColors();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const isPost = mode === 'post-session';

  // State machine: 'quadrant' → 'bubbles'
  const [step, setStep] = useState('quadrant');
  const [selectedQuadrant, setSelectedQuadrant] = useState(null);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [searchVisible, setSearchVisible] = useState(false);

  // --- Handlers ---

  const handleQuadrantSelect = useCallback((quadrantId) => {
    setSelectedQuadrant(quadrantId);
    setSelectedEmotion(null);
    setStep('bubbles');
  }, []);

  const handleUnsure = useCallback(() => {
    breathingPulse();
    const unsureMood = MOODS.find(m => m.id === 'unsure');
    setSelectedEmotion(unsureMood);
    setSelectedQuadrant(null);
    setStep('unsure');
  }, [breathingPulse]);

  const handleBubbleSelect = useCallback((emotionId) => {
    breathingPulse();
    const mood = MOODS.find(m => m.id === emotionId);
    setSelectedEmotion(mood);
    setTimeout(() => successPulse(), 180);
  }, [breathingPulse, successPulse]);

  const handleBubbleDeselect = useCallback(() => {
    setSelectedEmotion(null);
  }, []);

  const handleSearchSelect = useCallback((emotionId) => {
    setSearchVisible(false);
    // Find which quadrant this emotion belongs to
    const mood = MOODS.find(m => m.id === emotionId);
    if (mood?.quadrant) {
      setSelectedQuadrant(mood.quadrant);
      setStep('bubbles');
      // Select the emotion after a brief delay to allow render
      setTimeout(() => handleBubbleSelect(emotionId), 150);
    }
  }, [handleBubbleSelect]);

  const handleBack = useCallback(() => {
    if (step === 'unsure') {
      setStep('quadrant');
      setSelectedEmotion(null);
    } else if (step === 'bubbles') {
      setStep('quadrant');
      setSelectedQuadrant(null);
      setSelectedEmotion(null);
    } else {
      navigation.goBack();
    }
  }, [step, navigation]);

  const handleConfirm = useCallback(() => {
    if (!selectedEmotion) return;
    successPulse();

    if (isPost) {
      navigation.navigate('SuccessCelebration', {
        ...sessionData,
        postMood: selectedEmotion,
      });
    } else {
      navigation.navigate('BreathingPrep', {
        focusArea,
        mood: selectedEmotion,
      });
    }
  }, [selectedEmotion, isPost, navigation, sessionData, focusArea, successPulse]);

  // --- Derived ---

  const quadrant = selectedQuadrant ? getQuadrantById(selectedQuadrant) : null;

  const heading = step === 'unsure'
    ? 'That\u2019s okay.'
    : step === 'bubbles'
      ? 'What fits closest?'
      : isPost
        ? 'How do you feel\nafter showing up?'
        : 'Tap the color closest\nto how you feel';

  const subtitle = step === 'unsure'
    ? 'You showed up. That\u2019s what matters.'
    : step === 'bubbles'
      ? quadrant?.description || ''
      : isPost
        ? 'There\u2019s no wrong answer \u2014 just honesty.'
        : 'No judgment. Just noticing.';

  const validationText = selectedEmotion
    ? (isPost
        ? (POST_MOOD_RESPONSES[selectedEmotion.id] || '')
        : (MOOD_RESPONSES[selectedEmotion.id] || ''))
    : '';

  // Bubble cloud dimensions — fill available space
  const cloudWidth = windowWidth - 24;
  const cloudHeight = Math.min(windowHeight * 0.52, 460);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScreenHeader
        label={isPost ? 'REFLECTION' : 'CHECK-IN'}
        onBack={handleBack}
        rightAction={
          step !== 'unsure' ? (
            <Pressable
              onPress={() => setSearchVisible(true)}
              hitSlop={12}
              style={styles.searchButton}
            >
              <Ionicons name="search" size={20} color={c.textMuted} />
            </Pressable>
          ) : null
        }
      />

      {/* Heading */}
      <View style={styles.headingContainer}>
        <Animated.Text
          key={`heading-${step}-${selectedQuadrant || ''}`}
          entering={FadeInDown.duration(400).delay(100)}
          style={[styles.heading, { color: c.textPrimary }]}
        >
          {heading}
        </Animated.Text>

        <Animated.Text
          key={`subtitle-${step}-${selectedQuadrant || ''}`}
          entering={FadeInDown.duration(350).delay(200)}
          style={[styles.subtitle, { color: c.textSecondary }]}
        >
          {subtitle}
        </Animated.Text>
      </View>

      {/* Step 1: Quadrant selection */}
      {step === 'quadrant' && (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          style={styles.contentArea}
        >
          <QuadrantGrid
            onSelect={handleQuadrantSelect}
            onUnsure={handleUnsure}
            hapticTap={selectionTap}
          />
        </Animated.View>
      )}

      {/* Step 2: Bubble cloud */}
      {step === 'bubbles' && (
        <Animated.View
          entering={FadeIn.duration(350).delay(100)}
          exiting={FadeOut.duration(200)}
          style={styles.contentArea}
        >
          {/* Quadrant badge */}
          {quadrant && (
            <View style={[styles.quadrantBadge, { backgroundColor: quadrant.colorLight }]}>
              <View style={[styles.quadrantDot, { backgroundColor: quadrant.colorPrimary }]} />
              <Text style={[styles.quadrantBadgeLabel, { color: quadrant.colorDark }]}>
                {quadrant.label}
              </Text>
            </View>
          )}

          <BubbleCloud
            quadrantId={selectedQuadrant}
            selectedId={selectedEmotion?.id || null}
            onSelect={handleBubbleSelect}
            containerWidth={cloudWidth}
            containerHeight={cloudHeight}
          />
        </Animated.View>
      )}

      {/* Unsure state */}
      {step === 'unsure' && (
        <Animated.View
          entering={FadeIn.duration(300).delay(100)}
          style={styles.unsureSection}
        >
          <Text style={styles.unsureEmoji}>{'\uD83E\uDD0D'}</Text>
          <Text style={[styles.unsureValidation, { color: c.accentRust }]}>
            {MOOD_RESPONSES.unsure}
          </Text>

          <View style={styles.unsureButton}>
            <PrimaryButton
              title={isPost ? 'Complete' : 'Begin'}
              icon="arrow-forward"
              onPress={handleConfirm}
            />
          </View>
        </Animated.View>
      )}

      {/* Bottom sheet (for bubble selection) */}
      {step === 'bubbles' && (
        <EmotionBottomSheet
          emotion={selectedEmotion}
          validationText={validationText}
          buttonTitle={isPost ? 'Complete' : 'Begin'}
          onConfirm={handleConfirm}
          onDismiss={handleBubbleDeselect}
          visible={selectedEmotion !== null}
          quadrantColor={quadrant?.colorPrimary}
        />
      )}

      {/* Search overlay */}
      <BubbleSearchOverlay
        visible={searchVisible}
        onSelect={handleSearchSelect}
        onClose={() => setSearchVisible(false)}
      />
    </View>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headingContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    marginTop: 8,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  contentArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchButton: {
    padding: 8,
  },

  // --- Quadrant badge (shown in bubble view) ---
  quadrantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 12,
    alignSelf: 'center',
  },
  quadrantDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  quadrantBadgeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  // --- Unsure state ---
  unsureSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  unsureEmoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  unsureValidation: {
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  unsureButton: {
    width: '100%',
  },
});
