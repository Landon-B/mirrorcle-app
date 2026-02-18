import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { MOODS, MOOD_FAMILIES, getMoodsForFamily } from '../constants/feelings';
import { useApp } from '../context/AppContext';
import { ScreenHeader, PrimaryButton } from '../components/common';
import { typography } from '../styles/typography';
import { shadows } from '../styles/spacing';
import { useHaptics } from '../hooks/useHaptics';
import { useColors } from '../hooks/useColors';

// --- Warm validation for each specific feeling ---
// Pre-session: acknowledgment of where you are
const MOOD_RESPONSES = {
  // Peaceful
  calm:        'Stillness is a kind of strength.',
  grateful:    'What a beautiful place to begin.',
  content:     'There\u2019s so much wisdom in enough.',
  // Tender
  sad:         'There is honesty in feeling this. Honor it.',
  lonely:      'You are less alone than you think.',
  vulnerable:  'It takes strength to name that.',
  // Electric
  energized:   'Let that energy carry your words today.',
  confident:   'Trust that feeling. It knows you well.',
  hopeful:     'Hope is the bravest thing you can hold.',
  // Heavy
  anxious:     'You showed up anyway. That takes courage.',
  overwhelmed: 'You don\u2019t have to carry it all right now.',
  frustrated:  'Your feelings are asking to be heard.',
};

// Post-session: reflection on what just happened
const POST_MOOD_RESPONSES = {
  // Peaceful
  calm:        'You gave yourself that. Remember this feeling.',
  grateful:    'Gratitude after practice \u2014 that\u2019s growth.',
  content:     'This is what showing up feels like.',
  // Tender
  sad:         'Even in sadness, you chose yourself today.',
  lonely:      'You just spent time with someone who matters \u2014 you.',
  vulnerable:  'Being open is how the light gets in.',
  // Electric
  energized:   'That\u2019s the sound of someone who showed up.',
  confident:   'You spoke your truth. That changes everything.',
  hopeful:     'You\u2019re already becoming who you\u2019re meant to be.',
  // Heavy
  anxious:     'Be gentle with yourself \u2014 you just did something brave.',
  overwhelmed: 'You still came. That\u2019s more than enough.',
  frustrated:  'Friction means you\u2019re pushing against something real.',
};

export const MoodCheckInScreen = ({ navigation, route }) => {
  const { mode = 'pre-session', focusArea, ...sessionData } = route.params || {};
  const { user } = useApp();
  const { selectionTap, successPulse, breathingPulse } = useHaptics();
  const c = useColors();

  const isPost = mode === 'post-session';

  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);

  // Animated mood response
  const responseOpacity = useSharedValue(0);
  const responseTranslateY = useSharedValue(8);

  const handleFamilySelect = useCallback((familyId) => {
    selectionTap();
    setSelectedFamily(familyId);
    setSelectedMood(null);
    // Reset response
    responseOpacity.value = 0;
  }, [selectionTap, responseOpacity]);

  const handleMoodSelect = useCallback((moodId) => {
    breathingPulse();
    setSelectedMood(moodId);

    // Animate the response in
    responseOpacity.value = 0;
    responseTranslateY.value = 8;
    responseOpacity.value = withDelay(100, withTiming(1, { duration: 500 }));
    responseTranslateY.value = withDelay(100, withSpring(0, { damping: 20, stiffness: 150 }));

    // Warm confirmation haptic after a beat
    setTimeout(() => successPulse(), 180);
  }, [breathingPulse, successPulse, responseOpacity, responseTranslateY]);

  const handleBack = useCallback(() => {
    if (selectedFamily) {
      setSelectedFamily(null);
      setSelectedMood(null);
      responseOpacity.value = 0;
    } else {
      navigation.goBack();
    }
  }, [selectedFamily, navigation, responseOpacity]);

  const handleNext = () => {
    if (!selectedMood) return;

    const mood = MOODS.find(m => m.id === selectedMood);

    if (isPost) {
      navigation.navigate('SuccessCelebration', {
        ...sessionData,
        postMood: mood,
      });
    } else {
      navigation.navigate('BreathingPrep', {
        focusArea,
        mood,
      });
    }
  };

  const heading = selectedFamily
    ? 'Tell me more...'
    : isPost
      ? 'How do you feel\nafter showing up?'
      : 'Before we begin,\nhow are you right now?';

  const subtitle = selectedFamily
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

  // Progress dots: pre-session = step 2 of 2, post-session = step 1 of 2
  const totalDots = 2;
  const activeDot = isPost ? 0 : 1;

  const familyFeelings = selectedFamily ? getMoodsForFamily(selectedFamily) : [];
  const selectedFamilyData = selectedFamily
    ? MOOD_FAMILIES.find(f => f.id === selectedFamily)
    : null;

  // Split families into rows of 2
  const familyRows = [
    [MOOD_FAMILIES[0], MOOD_FAMILIES[1]],
    [MOOD_FAMILIES[2], MOOD_FAMILIES[3]],
  ];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScreenHeader
        label={isPost ? 'REFLECTION' : 'CHECK-IN'}
        onBack={handleBack}
      />

      <View style={styles.body}>
        {/* Heading */}
        <Animated.Text
          key={`heading-${selectedFamily || 'root'}`}
          entering={FadeInDown.duration(400).delay(100)}
          style={[styles.heading, { color: c.textPrimary }]}
        >
          {heading}
        </Animated.Text>

        <Animated.Text
          key={`subtitle-${selectedFamily || 'root'}`}
          entering={FadeInDown.duration(350).delay(200)}
          style={[styles.subtitle, { color: c.textSecondary }]}
        >
          {subtitle}
        </Animated.Text>

        {/* Layer 1: Family selection */}
        {!selectedFamily && (
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
          </View>
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

            {/* Feeling emoji cards (label revealed below on select) */}
            <View style={styles.feelingsGrid}>
              {familyFeelings.map((mood) => {
                const isSelected = selectedMood === mood.id;
                const isDimmed = selectedMood && !isSelected;
                return (
                  <Pressable
                    key={mood.id}
                    onPress={() => handleMoodSelect(mood.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${mood.label} mood`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View
                      style={[
                        styles.feelingCard,
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
                      <Text style={styles.feelingEmoji}>{mood.emoji}</Text>
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
          </View>
        )}

        <View style={styles.spacer} />
      </View>

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
    paddingHorizontal: 20,
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
  feelingCard: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
  },
  feelingEmoji: {
    fontSize: 36,
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
