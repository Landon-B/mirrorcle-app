import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
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
import { useApp } from '../context/AppContext';
import { ScreenHeader, PrimaryButton } from '../components/common';
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

// --- Warm validation for each specific feeling ---
// Pre-session: acknowledgment of where you are
const MOOD_RESPONSES = {
  // Peaceful
  calm:         'Stillness is a kind of strength.',
  grateful:     'What a beautiful place to begin.',
  content:      'There\u2019s so much wisdom in enough.',
  // Tender
  sad:          'There is honesty in feeling this. Honor it.',
  lonely:       'You are less alone than you think.',
  vulnerable:   'It takes strength to name that.',
  // Electric
  energized:    'Let that energy carry your words today.',
  confident:    'Trust that feeling. It knows you well.',
  hopeful:      'Hope is the bravest thing you can hold.',
  // Heavy
  anxious:      'You showed up anyway. That takes courage.',
  overwhelmed:  'You don\u2019t have to carry it all right now.',
  frustrated:   'Your feelings are asking to be heard.',
  ashamed:      'Shame shrinks in the light. You just let some in.',
  // Still
  numb:         'Being here when you feel nothing \u2014 that is something.',
  disconnected: 'You don\u2019t have to feel connected to show up.',
  drained:      'Even a low flame is still burning.',
  // Special
  unsure:       'That\u2019s okay. You\u2019re here, and that\u2019s what matters.',
};

// Post-session: reflection on what just happened
export const POST_MOOD_RESPONSES = {
  // Peaceful
  calm:         'You gave yourself that. Remember this feeling.',
  grateful:     'Gratitude after practice \u2014 that\u2019s growth.',
  content:      'This is what showing up feels like.',
  // Tender
  sad:          'Even in sadness, you chose yourself today.',
  lonely:       'You just spent time with someone who matters \u2014 you.',
  vulnerable:   'Being open is how the light gets in.',
  // Electric
  energized:    'That\u2019s the sound of someone who showed up.',
  confident:    'You spoke your truth. That changes everything.',
  hopeful:      'You\u2019re already becoming who you\u2019re meant to be.',
  // Heavy
  anxious:      'Be gentle with yourself \u2014 you just did something brave.',
  overwhelmed:  'You still came. That\u2019s more than enough.',
  frustrated:   'Friction means you\u2019re pushing against something real.',
  ashamed:      'You faced yourself in the mirror. Shame can\u2019t survive that.',
  // Still
  numb:         'Something stirred, even if you can\u2019t name it yet.',
  disconnected: 'You just reconnected with yourself, even briefly.',
  drained:      'Rest is not giving up. You showed up first.',
  // Special
  unsure:       'Sometimes the shift is deeper than words.',
};

export const MoodCheckInScreen = ({ navigation, route }) => {
  const { mode = 'pre-session', focusArea, ...sessionData } = route.params || {};
  const { user } = useApp();
  const { selectionTap, successPulse, breathingPulse } = useHaptics();
  const c = useColors();

  const isPost = mode === 'post-session';

  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedIntensity, setSelectedIntensity] = useState(null);

  // Animated mood response
  const responseOpacity = useSharedValue(0);
  const responseTranslateY = useSharedValue(8);

  // Animated intensity
  const intensityOpacity = useSharedValue(0);

  const handleFamilySelect = useCallback((familyId) => {
    selectionTap();
    setSelectedFamily(familyId);
    setSelectedMood(null);
    setSelectedIntensity(null);
    // Reset response
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

    // Animate intensity selector in after response
    intensityOpacity.value = 0;
    intensityOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));

    // Warm confirmation haptic after a beat
    setTimeout(() => successPulse(), 180);
  }, [breathingPulse, successPulse, responseOpacity, responseTranslateY, intensityOpacity]);

  const handleUnsure = useCallback(() => {
    breathingPulse();
    setSelectedFamily(null);
    setSelectedMood('unsure');
    setSelectedIntensity(null);

    // Animate the response in
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
      navigation.goBack();
    }
  }, [selectedFamily, selectedMood, navigation, responseOpacity, intensityOpacity]);

  const handleNext = () => {
    if (!selectedMood) return;

    const mood = MOODS.find(m => m.id === selectedMood);

    if (isPost) {
      navigation.navigate('SuccessCelebration', {
        ...sessionData,
        postMood: mood,
        postIntensity: selectedIntensity,
      });
    } else {
      navigation.navigate('BreathingPrep', {
        focusArea,
        mood,
        intensity: selectedIntensity,
      });
    }
  };

  const heading = selectedMood === 'unsure'
    ? 'That\u2019s okay.'
    : selectedFamily
      ? 'Tell me more...'
      : isPost
        ? 'How do you feel\nafter showing up?'
        : 'Before we begin,\nhow are you right now?';

  const subtitle = selectedMood === 'unsure'
    ? 'You showed up. That\u2019s what matters.'
    : selectedFamily
      ? getFamilySubtitle(selectedFamily)
      : isPost
        ? 'There\u2019s no wrong answer \u2014 just honesty.'
        : 'No judgment. Just noticing.';

  const buttonTitle = isPost ? 'Complete' : 'Begin';

  const responseText = selectedMood
    ? (isPost ? POST_MOOD_RESPONSES[selectedMood] : MOOD_RESPONSES[selectedMood])
    : '';

  const responseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: responseOpacity.value,
    transform: [{ translateY: responseTranslateY.value }],
  }));

  const intensityAnimatedStyle = useAnimatedStyle(() => ({
    opacity: intensityOpacity.value,
  }));

  // Progress dots: pre-session = step 2 of 2, post-session = step 1 of 2
  const totalDots = 2;
  const activeDot = isPost ? 0 : 1;

  const familyFeelings = selectedFamily ? getMoodsForFamily(selectedFamily) : [];
  const selectedFamilyData = selectedFamily
    ? MOOD_FAMILIES.find(f => f.id === selectedFamily)
    : null;

  // 5 families in 2-2-1 layout
  const familyRows = [
    [MOOD_FAMILIES[0], MOOD_FAMILIES[1]],
    [MOOD_FAMILIES[2], MOOD_FAMILIES[3]],
    [MOOD_FAMILIES[4]], // Still — centered alone, intentionally
  ];

  // Determine if this family has 4 moods (needs 2x2 grid)
  const useWrappedGrid = familyFeelings.length > 3;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScreenHeader
        label={isPost ? 'REFLECTION' : 'CHECK-IN'}
        onBack={handleBack}
      />

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
            <Animated.View
              entering={FadeInDown.duration(300).delay(650)}
            >
              <Pressable onPress={handleUnsure} hitSlop={16}>
                <Text style={[styles.unsureLink, { color: c.textMuted }]}>
                  I can't quite name it
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        )}

        {/* "Unsure" state — show validation response directly */}
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

        {/* Layer 2: Specific feelings within selected family */}
        {selectedFamily && (
          <View style={styles.feelingsSection}>
            {/* Selected family badge */}
            <View
              style={[styles.familyBadge, { backgroundColor: c.surfaceTertiary }]}
            >
              <Text style={styles.familyBadgeEmoji}>{selectedFamilyData?.emoji}</Text>
              <Text style={[styles.familyBadgeLabel, { color: c.accentRust }]}>
                {selectedFamilyData?.label}
              </Text>
            </View>

            {/* Feeling emoji cards — adaptive grid */}
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

            {/* Revealed label + validation (like focus screen) */}
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

            {/* Intensity selector — appears after mood is selected */}
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

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <PrimaryButton
          title={buttonTitle}
          icon="arrow-forward"
          onPress={handleNext}
          disabled={!selectedMood}
        />

        <View style={styles.dots}>
          {Array.from({ length: totalDots }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: c.disabled },
                i === activeDot && [styles.dotActive, { backgroundColor: c.accentRust }],
              ]}
            />
          ))}
        </View>
      </View>
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

  // --- Family cards (layer 1) ---
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

  // --- "Not sure" escape ---
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

  // --- Response (label + validation revealed on select) ---
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

  // --- Intensity selector ---
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

  // --- Footer ---
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
  },
});
