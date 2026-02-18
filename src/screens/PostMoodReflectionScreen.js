import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { MOODS, MOOD_FAMILIES, getMoodsForFamily } from '../constants/feelings';
import { POST_MOOD_RESPONSES } from './MoodCheckInScreen';
import { ScreenHeader, PrimaryButton } from '../components/common';
import { sessionService } from '../services/session';
import { typography } from '../styles/typography';
import { shadows } from '../styles/spacing';
import { useHaptics } from '../hooks/useHaptics';
import { useColors } from '../hooks/useColors';

// --- Mood intensity levels ---
const INTENSITY_LEVELS = [
  { value: 1, label: 'A little' },
  { value: 2, label: 'Somewhat' },
  { value: 3, label: 'Deeply' },
];

export const PostMoodReflectionScreen = ({ navigation, route }) => {
  const {
    sessionId,
    completedPrompts = 0,
    duration = 0,
    feeling,
    preMood,
    focusArea,
    preIntensity,
  } = route.params || {};

  const { selectionTap, successPulse, breathingPulse } = useHaptics();
  const c = useColors();

  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedIntensity, setSelectedIntensity] = useState(null);
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection] = useState('');

  // Animated mood response
  const responseOpacity = useSharedValue(0);
  const responseTranslateY = useSharedValue(8);
  const intensityOpacity = useSharedValue(0);

  const handleFamilySelect = useCallback((familyId) => {
    selectionTap();
    setSelectedFamily(familyId);
    setSelectedMood(null);
    setSelectedIntensity(null);
    responseOpacity.value = 0;
    intensityOpacity.value = 0;
  }, [selectionTap, responseOpacity, intensityOpacity]);

  const handleMoodSelect = useCallback((moodId) => {
    breathingPulse();
    setSelectedMood(moodId);
    setSelectedIntensity(null);

    // Animate the response in
    responseOpacity.value = 0;
    responseTranslateY.value = 8;
    responseOpacity.value = withDelay(100, withTiming(1, { duration: 500 }));
    responseTranslateY.value = withDelay(100, withSpring(0, { damping: 20, stiffness: 150 }));

    // Animate intensity selector in
    intensityOpacity.value = 0;
    intensityOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));

    setTimeout(() => successPulse(), 180);
  }, [breathingPulse, successPulse, responseOpacity, responseTranslateY, intensityOpacity]);

  const handleUnsure = useCallback(() => {
    breathingPulse();
    setSelectedFamily(null);
    setSelectedMood('unsure');
    setSelectedIntensity(null);

    responseOpacity.value = 0;
    responseTranslateY.value = 8;
    responseOpacity.value = withDelay(100, withTiming(1, { duration: 500 }));
    responseTranslateY.value = withDelay(100, withSpring(0, { damping: 20, stiffness: 150 }));

    setTimeout(() => successPulse(), 180);
  }, [breathingPulse, successPulse, responseOpacity, responseTranslateY]);

  const handleIntensitySelect = useCallback((value) => {
    selectionTap();
    setSelectedIntensity(value);
  }, [selectionTap]);

  const handleBack = useCallback(() => {
    if (selectedMood === 'unsure') {
      setSelectedMood(null);
      responseOpacity.value = 0;
      intensityOpacity.value = 0;
    } else if (selectedFamily) {
      setSelectedFamily(null);
      setSelectedMood(null);
      setSelectedIntensity(null);
      responseOpacity.value = 0;
      intensityOpacity.value = 0;
    } else {
      // Can't really go back to camera session — skip instead
      handleSkip();
    }
  }, [selectedFamily, selectedMood, responseOpacity, intensityOpacity]);

  const handleComplete = async () => {
    if (!selectedMood) return;

    const postMood = MOODS.find(m => m.id === selectedMood);

    // Persist post-session mood and reflection (best-effort)
    if (sessionId) {
      try {
        await sessionService.recordMoodShift(sessionId, selectedMood, selectedIntensity);
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
      postMood,
      postIntensity: selectedIntensity,
      preIntensity,
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

  const heading = selectedMood === 'unsure'
    ? 'That\u2019s okay.'
    : selectedFamily
      ? 'Tell me more...'
      : 'And now...\nhow are you?';

  const subtitle = selectedMood === 'unsure'
    ? 'Sometimes the shift is deeper than words.'
    : selectedFamily
      ? getFamilySubtitle(selectedFamily)
      : 'Just noticing what shifted.';

  const responseText = selectedMood
    ? (POST_MOOD_RESPONSES[selectedMood] || '')
    : '';

  const responseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: responseOpacity.value,
    transform: [{ translateY: responseTranslateY.value }],
  }));

  const intensityAnimatedStyle = useAnimatedStyle(() => ({
    opacity: intensityOpacity.value,
  }));

  const familyFeelings = selectedFamily ? getMoodsForFamily(selectedFamily) : [];
  const selectedFamilyData = selectedFamily
    ? MOOD_FAMILIES.find(f => f.id === selectedFamily)
    : null;

  // 5 families in 2-2-1 layout
  const familyRows = [
    [MOOD_FAMILIES[0], MOOD_FAMILIES[1]],
    [MOOD_FAMILIES[2], MOOD_FAMILIES[3]],
    [MOOD_FAMILIES[4]],
  ];

  const useWrappedGrid = familyFeelings.length > 3;

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
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Heading */}
          <Animated.Text
            key={`heading-${selectedFamily || selectedMood || 'root'}`}
            entering={FadeInDown.duration(400).delay(100)}
            style={[styles.heading, { color: c.textPrimary }]}
          >
            {heading}
          </Animated.Text>

          <Animated.Text
            key={`subtitle-${selectedFamily || selectedMood || 'root'}`}
            entering={FadeInDown.duration(350).delay(200)}
            style={[styles.subtitle, { color: c.textSecondary }]}
          >
            {subtitle}
          </Animated.Text>

          {/* Layer 1: Family selection */}
          {!selectedFamily && selectedMood !== 'unsure' && (
            <View style={styles.familyGrid}>
              {familyRows.map((row, rowIndex) => (
                <Animated.View
                  key={rowIndex}
                  entering={FadeInDown.duration(400).delay(280 + rowIndex * 120).springify().damping(18)}
                  style={styles.familyRow}
                >
                  {row.map((family) => (
                    <Pressable
                      key={family.id}
                      onPress={() => handleFamilySelect(family.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`${family.label} \u2014 ${family.description}`}
                    >
                      <View style={[styles.familyCard, { backgroundColor: c.surface }]}>
                        <Text style={styles.familyEmoji}>{family.emoji}</Text>
                        <Text style={[styles.familyLabel, { color: c.textPrimary }]}>
                          {family.label}
                        </Text>
                        <Text style={[styles.familyDescription, { color: c.textMuted }]}>
                          {family.description}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </Animated.View>
              ))}

              {/* "Not sure" escape hatch */}
              <Animated.View entering={FadeInDown.duration(300).delay(650)}>
                <Pressable onPress={handleUnsure} hitSlop={16}>
                  <Text style={[styles.unsureLink, { color: c.textMuted }]}>
                    I can't quite name it
                  </Text>
                </Pressable>
              </Animated.View>
            </View>
          )}

          {/* "Unsure" state */}
          {selectedMood === 'unsure' && !selectedFamily && (
            <Animated.View
              entering={FadeIn.duration(300).delay(100)}
              style={styles.unsureSection}
            >
              <Text style={styles.unsureEmoji}>{MOODS.find(m => m.id === 'unsure')?.emoji}</Text>
              <Animated.View style={[styles.responseContainer, responseAnimatedStyle]}>
                {responseText ? (
                  <Text style={[styles.responseText, { color: c.accentRust }]}>
                    {responseText}
                  </Text>
                ) : null}
              </Animated.View>
            </Animated.View>
          )}

          {/* Layer 2: Specific feelings */}
          {selectedFamily && (
            <View style={styles.feelingsSection}>
              {/* Family badge */}
              <View style={[styles.familyBadge, { backgroundColor: c.surfaceTertiary }]}>
                <Text style={styles.familyBadgeEmoji}>{selectedFamilyData?.emoji}</Text>
                <Text style={[styles.familyBadgeLabel, { color: c.accentRust }]}>
                  {selectedFamilyData?.label}
                </Text>
              </View>

              {/* Feeling cards */}
              <View style={[
                styles.feelingsGrid,
                useWrappedGrid && styles.feelingsGridWrapped,
              ]}>
                {familyFeelings.map((mood) => {
                  const isSelected = selectedMood === mood.id;
                  const isDimmed = selectedMood && !isSelected;
                  return (
                    <Pressable
                      key={mood.id}
                      onPress={() => handleMoodSelect(mood.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`${mood.label} \u2014 ${mood.description}`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <View
                        style={[
                          styles.feelingCard,
                          useWrappedGrid && styles.feelingCardSmall,
                          {
                            backgroundColor: isSelected ? c.accentPeach : c.surface,
                            borderColor: isSelected ? c.accentRust : c.border,
                            borderWidth: isSelected ? 2.5 : 1.5,
                            shadowColor: isSelected ? c.accentRust : '#000',
                            shadowOpacity: isSelected ? 0.3 : 0.06,
                            shadowRadius: isSelected ? 16 : 8,
                            elevation: isSelected ? 8 : 3,
                            opacity: isDimmed ? 0.4 : 1,
                            transform: [{ scale: isSelected ? 1.05 : (isDimmed ? 0.95 : 1) }],
                          },
                        ]}
                      >
                        <Text style={[
                          styles.feelingEmoji,
                          useWrappedGrid && styles.feelingEmojiSmall,
                        ]}>{mood.emoji}</Text>
                        <Text style={[
                          styles.feelingMicroLabel,
                          { color: isSelected ? c.accentRust : c.textMuted },
                        ]}>
                          {mood.label}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {/* Validation response */}
              <Animated.View style={[styles.responseContainer, responseAnimatedStyle]}>
                {selectedMood && (
                  <>
                    <Text style={[styles.selectedMoodLabel, { color: c.textPrimary }]}>
                      {MOODS.find(m => m.id === selectedMood)?.label}
                    </Text>
                    {responseText ? (
                      <Text style={[styles.responseText, { color: c.accentRust }]}>
                        {responseText}
                      </Text>
                    ) : null}
                  </>
                )}
              </Animated.View>

              {/* Intensity selector */}
              {selectedMood && (
                <Animated.View style={[styles.intensitySection, intensityAnimatedStyle]}>
                  <Text style={[styles.intensityLabel, { color: c.textMuted }]}>How much?</Text>
                  <View style={styles.intensityRow}>
                    {INTENSITY_LEVELS.map((level) => {
                      const isActive = selectedIntensity === level.value;
                      return (
                        <Pressable
                          key={level.value}
                          onPress={() => handleIntensitySelect(level.value)}
                          hitSlop={8}
                          accessibilityRole="button"
                          accessibilityLabel={`${level.label} intensity`}
                          accessibilityState={{ selected: isActive }}
                        >
                          <View style={styles.intensityOption}>
                            <View style={[
                              styles.intensityDot,
                              {
                                backgroundColor: isActive ? c.accentRust : c.surfaceTertiary,
                                transform: [{ scale: isActive ? 1.15 : 1 }],
                              },
                            ]} />
                            <Text style={[
                              styles.intensityText,
                              { color: isActive ? c.accentRust : c.textMuted },
                              isActive && { fontWeight: '600' },
                            ]}>
                              {level.label}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </Animated.View>
              )}
            </View>
          )}

          {/* Optional reflection — appears after mood is selected */}
          {selectedMood && (
            <Animated.View entering={FadeIn.delay(800).duration(400)} style={styles.reflectionSection}>
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

        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <PrimaryButton
            title="Complete"
            icon="sparkles"
            onPress={handleComplete}
            disabled={!selectedMood}
          />

          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: c.textMuted }]}>NOT RIGHT NOW</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// --- Helpers ---

function getFamilySubtitle(familyId) {
  switch (familyId) {
    case 'peaceful': return 'What shade of peace are you in?';
    case 'tender':   return 'Let yourself name it gently.';
    case 'electric': return 'Where is that energy coming from?';
    case 'heavy':    return 'You\u2019re safe to feel this here.';
    case 'still':    return 'There\u2019s no wrong way to feel here.';
    default:         return 'Which feels closest?';
  }
}

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 28,
  },

  // --- Family cards ---
  familyGrid: {
    gap: 14,
    alignItems: 'center',
  },
  familyRow: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
  },
  familyCard: {
    width: 165,
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  familyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  familyLabel: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  familyDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },

  // --- "Not sure" ---
  unsureLink: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  unsureSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  unsureEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },

  // --- Feelings (layer 2) ---
  feelingsSection: {
    width: '100%',
  },
  familyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 24,
    alignSelf: 'center',
  },
  familyBadgeEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  familyBadgeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  feelingsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  feelingsGridWrapped: {
    flexWrap: 'wrap',
    gap: 14,
  },
  feelingCard: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
  },
  feelingCardSmall: {
    width: 82,
    height: 82,
    borderRadius: 41,
  },
  feelingEmoji: {
    fontSize: 32,
  },
  feelingEmojiSmall: {
    fontSize: 28,
  },
  feelingMicroLabel: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
    maxWidth: 72,
  },

  // --- Response ---
  responseContainer: {
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    paddingHorizontal: 24,
  },
  selectedMoodLabel: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  responseText: {
    fontFamily: typography.fontFamily.serifItalic,
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },

  // --- Intensity ---
  intensitySection: {
    alignItems: 'center',
    marginTop: 20,
  },
  intensityLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  intensityRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  intensityOption: {
    alignItems: 'center',
    gap: 6,
  },
  intensityDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  intensityText: {
    fontSize: 12,
  },

  // --- Reflection ---
  reflectionSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  reflectionTrigger: {
    fontSize: 14,
  },
  reflectionInputWrapper: {
    width: '100%',
    borderRadius: 16,
    ...shadows.card,
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
    marginTop: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
