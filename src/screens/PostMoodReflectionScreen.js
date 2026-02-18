import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
} from 'react-native-reanimated';
import {
  MOODS,
  getQuadrantById,
  MOOD_RESPONSES,
  POST_MOOD_RESPONSES,
} from '../constants/feelings';
import { ScreenHeader, PrimaryButton } from '../components/common';
import { QuadrantGrid } from '../components/mood/QuadrantGrid';
import { BubbleCloud } from '../components/mood/BubbleCloud';
import { EmotionBottomSheet } from '../components/mood/EmotionBottomSheet';
import { sessionService } from '../services/session';
import { typography } from '../styles/typography';
import { shadows } from '../styles/spacing';
import { useHaptics } from '../hooks/useHaptics';
import { useColors } from '../hooks/useColors';

export const PostMoodReflectionScreen = ({ navigation, route }) => {
  const {
    sessionId,
    completedPrompts = 0,
    duration = 0,
    feeling,
    preMood,
    focusArea,
  } = route.params || {};

  const { selectionTap, successPulse, breathingPulse } = useHaptics();
  const c = useColors();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // State machine: 'quadrant' → 'bubbles'
  const [step, setStep] = useState('quadrant');
  const [selectedQuadrant, setSelectedQuadrant] = useState(null);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection] = useState('');

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

  const handleBack = useCallback(() => {
    if (step === 'unsure') {
      setStep('quadrant');
      setSelectedEmotion(null);
    } else if (step === 'bubbles') {
      setStep('quadrant');
      setSelectedQuadrant(null);
      setSelectedEmotion(null);
    } else {
      handleSkip();
    }
  }, [step]);

  const handleComplete = async () => {
    if (!selectedEmotion) return;
    successPulse();

    // Persist post-session mood and reflection (best-effort)
    if (sessionId) {
      try {
        await sessionService.recordMoodShift(sessionId, selectedEmotion.id);
      } catch (err) {
        console.log('Failed to record mood shift:', err);
      }

      if (reflection.trim()) {
        try {
          await sessionService.saveReflection(sessionId, reflection.trim());
        } catch (err) {
          console.log('Failed to save reflection:', err);
        }
      }
    }

    navigation.navigate('SuccessCelebration', {
      completedPrompts,
      duration,
      feeling,
      preMood,
      postMood: selectedEmotion,
      reflection: reflection.trim() || null,
      focusArea,
    });
  };

  const handleSkip = () => {
    navigation.navigate('SuccessCelebration', {
      completedPrompts,
      duration,
      feeling,
      preMood,
      focusArea,
    });
  };

  // --- Derived ---

  const quadrant = selectedQuadrant ? getQuadrantById(selectedQuadrant) : null;

  const heading = step === 'unsure'
    ? 'That\u2019s okay.'
    : step === 'bubbles'
      ? 'What fits closest?'
      : 'And now...\nhow are you?';

  const subtitle = step === 'unsure'
    ? 'Sometimes the shift is deeper than words.'
    : step === 'bubbles'
      ? quadrant?.description || ''
      : 'Just noticing what shifted.';

  const validationText = selectedEmotion
    ? (POST_MOOD_RESPONSES[selectedEmotion.id] || '')
    : '';

  const cloudWidth = windowWidth - 24;
  const cloudHeight = Math.min(windowHeight * 0.42, 380);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScreenHeader
        label="REFLECTION"
        onBack={handleBack}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
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

            {/* Reflection input — appears after mood selection */}
            {selectedEmotion && (
              <Animated.View entering={FadeIn.delay(600).duration(400)} style={styles.reflectionSection}>
                {!showReflection ? (
                  <Pressable onPress={() => setShowReflection(true)}>
                    <Text style={[styles.reflectionTrigger, { color: c.accentRust }]}>
                      Add a reflection...
                    </Text>
                  </Pressable>
                ) : (
                  <View style={[styles.reflectionInputWrapper, { backgroundColor: c.surface }]}>
                    <TextInput
                      style={[styles.reflectionInput, { color: c.textPrimary }]}
                      placeholder="What came up for you?"
                      placeholderTextColor={c.inputPlaceholder}
                      multiline
                      maxLength={500}
                      value={reflection}
                      onChangeText={setReflection}
                      autoFocus
                    />
                  </View>
                )}
              </Animated.View>
            )}
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
              {POST_MOOD_RESPONSES.unsure}
            </Text>

            <View style={styles.unsureButton}>
              <PrimaryButton
                title="Complete"
                icon="sparkles"
                onPress={handleComplete}
              />
            </View>
          </Animated.View>
        )}

        {/* Bottom sheet (for bubble selection) */}
        {step === 'bubbles' && (
          <EmotionBottomSheet
            emotion={selectedEmotion}
            validationText={validationText}
            buttonTitle="Complete"
            onConfirm={handleComplete}
            onDismiss={handleBubbleDeselect}
            visible={selectedEmotion !== null}
            quadrantColor={quadrant?.colorPrimary}
          />
        )}

        {/* Footer — skip option */}
        {step === 'quadrant' && (
          <View style={styles.footer}>
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={[styles.skipText, { color: c.textMuted }]}>NOT RIGHT NOW</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
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

  // --- Quadrant badge ---
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

  // --- Reflection ---
  reflectionSection: {
    marginTop: 12,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
  },
  reflectionTrigger: {
    fontSize: 14,
  },
  reflectionInputWrapper: {
    width: '100%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  reflectionInput: {
    minHeight: 80,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
  },

  // --- Footer ---
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
