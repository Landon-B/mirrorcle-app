import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { QUADRANTS, POST_MOOD_RESPONSES, getMoodById, getQuadrantById } from '../constants/feelings';
import { ScreenHeader, PrimaryButton } from '../components/common';
import { sessionService } from '../services/session';
import { typography } from '../styles/typography';
import { useHaptics } from '../hooks/useHaptics';
import { useColors } from '../hooks/useColors';

// Map quadrant-level selections to representative mood IDs
// so recordMoodShift() receives valid mood IDs from the MOODS array.
const QUADRANT_MOOD_MAP = {
  bright: 'energized',
  charged: 'restless',
  tender: 'calm',
  deep: 'melancholy',
  unsure: 'unsure',
};

const CIRCLE_SIZE = 72;

export const PostMoodReflectionScreen = ({ navigation, route }) => {
  const {
    sessionId,
    completedPrompts = 0,
    duration = 0,
    feeling,
    preMood,
    focusArea,
  } = route.params || {};

  const { breathingPulse, successPulse } = useHaptics();
  const c = useColors();

  const [selectedQuadrant, setSelectedQuadrant] = useState(null);
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection] = useState('');

  // --- Handlers ---

  const handleSelect = (quadrantId) => {
    breathingPulse();
    setSelectedQuadrant(quadrantId);
    setTimeout(() => successPulse(), 180);
  };

  const handleUnsure = () => {
    breathingPulse();
    setSelectedQuadrant('unsure');
  };

  const handleComplete = async () => {
    if (!selectedQuadrant) return;
    successPulse();

    const moodId = QUADRANT_MOOD_MAP[selectedQuadrant];

    // Persist post-session mood and reflection (best-effort)
    if (sessionId) {
      try {
        await sessionService.recordMoodShift(sessionId, moodId);
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

    // Pass quadrant-level data for display (not the mapped mood).
    // The user chose a quadrant, not a specific emotion — the celebration
    // screen should reflect that level of granularity.
    const quadrantData = selectedQuadrant !== 'unsure'
      ? getQuadrantById(selectedQuadrant)
      : null;

    navigation.navigate('SuccessCelebration', {
      completedPrompts,
      duration,
      feeling,
      preMood,
      postQuadrant: quadrantData,
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

  const moodId = selectedQuadrant ? QUADRANT_MOOD_MAP[selectedQuadrant] : null;
  const validationText = moodId ? (POST_MOOD_RESPONSES[moodId] || '') : '';

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScreenHeader
        label="REFLECTION"
        onBack={handleSkip}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Top spacer — pushes content toward center */}
        <View style={styles.spacer} />

        {/* Heading */}
        <View style={styles.headingContainer}>
          <Animated.Text
            entering={FadeInDown.duration(400).delay(100)}
            style={[styles.heading, { color: c.textPrimary }]}
          >
            And now...{'\n'}how are you?
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.duration(350).delay(200)}
            style={[styles.subtitle, { color: c.textSecondary }]}
          >
            Just noticing what shifted.
          </Animated.Text>
        </View>

        {/* Quadrant row */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(300).springify().damping(16)}
          style={styles.quadrantRow}
        >
          {QUADRANTS.map((q) => {
            const isSelected = selectedQuadrant === q.id;
            const isDimmed = selectedQuadrant && !isSelected && selectedQuadrant !== 'unsure';

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

        {/* Unsure option */}
        <Animated.View entering={FadeIn.duration(300).delay(500)}>
          <Pressable onPress={handleUnsure} hitSlop={12} style={styles.unsureLink}>
            <Text
              style={[
                styles.unsureLinkText,
                { color: selectedQuadrant === 'unsure' ? c.accentRust : c.textMuted },
              ]}
            >
              I'm not sure
            </Text>
          </Pressable>
        </Animated.View>

        {/* Validation + reflection (appears after selection) */}
        {selectedQuadrant && (
          <Animated.View
            key={`response-${selectedQuadrant}`}
            entering={FadeIn.duration(400).delay(100)}
            style={styles.responseSection}
          >
            <Text style={[styles.validationText, { color: c.accentRust }]}>
              {validationText}
            </Text>

            {/* Reflection input */}
            {!showReflection ? (
              <Pressable onPress={() => setShowReflection(true)} style={styles.reflectionTrigger}>
                <Text style={[styles.reflectionTriggerText, { color: c.textMuted }]}>
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

        {/* Bottom spacer — balances the centering */}
        <View style={styles.spacer} />

        {/* Footer */}
        <View style={styles.footer}>
          {selectedQuadrant && (
            <Animated.View entering={FadeIn.duration(300)}>
              <PrimaryButton
                title="Complete"
                icon="sparkles"
                onPress={handleComplete}
              />
            </Animated.View>
          )}

          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: c.textMuted }]}>NOT RIGHT NOW</Text>
          </Pressable>
        </View>
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
    marginBottom: 28,
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

  // --- Quadrant row ---
  quadrantRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    paddingHorizontal: 20,
    marginBottom: 20,
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

  // --- Unsure ---
  unsureLink: {
    alignSelf: 'center',
    paddingVertical: 8,
    marginBottom: 24,
  },
  unsureLinkText: {
    fontSize: 14,
  },

  // --- Response section ---
  responseSection: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  validationText: {
    fontFamily: typography.fontFamily.serifItalic,
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  reflectionTrigger: {
    paddingVertical: 4,
  },
  reflectionTriggerText: {
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

  spacer: {
    flex: 1,
  },

  // --- Footer ---
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    marginTop: 8,
  },
  skipText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
