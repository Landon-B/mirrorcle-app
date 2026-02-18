import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { FOCUS_AREAS } from '../constants/focusAreas';
import { focusService } from '../services/focus';
import { useFeatureGate } from '../components/pro/FeatureGate';
import { ScreenHeader, PrimaryButton } from '../components/common';
import { typography } from '../styles/typography';
import { useHaptics } from '../hooks/useHaptics';
import { useColors } from '../hooks/useColors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// AnimatedPressable not needed — entering animations on rows, View handles selection state

// Gentle affirmation that appears after choosing a focus
const FOCUS_AFFIRMATIONS = {
  'self-worth': 'You deserve every good thing coming your way.',
  'confidence': 'There is quiet power in showing up as yourself.',
  'love': 'The love you give begins with the love you hold.',
  'boundaries': 'Protecting your peace is an act of self-love.',
  'abundance': 'You are already enough. More is on its way.',
  'healing': 'Every breath is a gentle step forward.',
};

// Size of each emoji circle
const CIRCLE_SIZE = 72;
const CIRCLE_HIT = CIRCLE_SIZE + 12; // touch target

export const FocusSelectionScreen = ({ navigation }) => {
  const [selectedArea, setSelectedArea] = useState(null);
  const { isPro, checkAccess, PaywallComponent } = useFeatureGate();
  const { selectionTap, successPulse } = useHaptics();
  const c = useColors();

  // Animated affirmation + label response
  const responseOpacity = useSharedValue(0);
  const responseTranslateY = useSharedValue(10);

  const handleContinue = () => {
    if (!selectedArea) return;

    const focusArea = FOCUS_AREAS.find(f => f.id === selectedArea);

    // Persist today's focus (fire-and-forget)
    focusService.setTodaysFocus(focusArea.id).catch(console.error);

    navigation.navigate('MoodCheckIn', {
      mode: 'pre-session',
      focusArea,
    });
  };

  const handleSelectArea = (id) => {
    selectionTap();
    setSelectedArea(id);

    // Animate the response in
    responseOpacity.value = 0;
    responseTranslateY.value = 10;
    responseOpacity.value = withDelay(120, withTiming(1, { duration: 450 }));
    responseTranslateY.value = withDelay(120, withSpring(0, { damping: 20, stiffness: 150 }));

    // Warm confirmation haptic after a beat
    setTimeout(() => successPulse(), 180);
  };

  const handleCustomPress = () => {
    if (!isPro) {
      checkAccess('custom_focus');
    }
  };

  const selectedData = selectedArea ? FOCUS_AREAS.find(f => f.id === selectedArea) : null;
  const affirmationText = selectedArea ? FOCUS_AFFIRMATIONS[selectedArea] : '';

  const responseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: responseOpacity.value,
    transform: [{ translateY: responseTranslateY.value }],
  }));

  // Layout: 3 rows of 2, with gentle horizontal offsets for organic feel
  const rows = [
    [FOCUS_AREAS[0], FOCUS_AREAS[1]],
    [FOCUS_AREAS[2], FOCUS_AREAS[3]],
    [FOCUS_AREAS[4], FOCUS_AREAS[5]],
  ];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScreenHeader
        label="CHECK-IN"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.body}>
        {/* Heading */}
        <Animated.Text
          entering={FadeInDown.duration(500).delay(80)}
          style={[styles.heading, { color: c.textPrimary }]}
        >
          What part of you{'\n'}wants attention today?
        </Animated.Text>

        {/* Emoji constellation */}
        <View style={styles.constellation}>
          {rows.map((row, rowIndex) => (
            <Animated.View
              key={rowIndex}
              entering={FadeInDown.duration(400).delay(250 + rowIndex * 140).springify().damping(16)}
              style={styles.constellationRow}
            >
              {row.map((area) => {
                const isSelected = selectedArea === area.id;
                const isDimmed = selectedArea && !isSelected;
                return (
                  <Pressable
                    key={area.id}
                    onPress={() => handleSelectArea(area.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${area.label} focus area`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View
                      style={[
                        styles.emojiCircle,
                        {
                          backgroundColor: isSelected ? c.accentPeach : c.surface,
                          borderColor: isSelected ? c.accentRust : c.border,
                          borderWidth: isSelected ? 3 : 1.5,
                          shadowColor: isSelected ? c.accentRust : '#000',
                          shadowOpacity: isSelected ? 0.4 : 0.06,
                          shadowRadius: isSelected ? 20 : 8,
                          elevation: isSelected ? 8 : 3,
                          opacity: isDimmed ? 0.3 : 1,
                          transform: [{ scale: isSelected ? 1.2 : (isDimmed ? 0.85 : 1) }],
                        },
                      ]}
                    >
                      <Text style={styles.emoji}>
                        {area.emoji}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </Animated.View>
          ))}
        </View>

        {/* Revealed label + affirmation (only after selection) */}
        <Animated.View style={[styles.responseSection, responseAnimatedStyle]}>
          {selectedData && (
            <>
              <Text style={[styles.selectedLabel, { color: c.textPrimary }]}>
                {selectedData.label}
              </Text>
              <Text style={[styles.affirmationText, { color: c.accentRust }]}>
                {affirmationText}
              </Text>
            </>
          )}
        </Animated.View>

        <View style={styles.spacer} />

        {/* Custom focus — subtle text link, not a locked input */}
        {isPro && (
          <Animated.View entering={FadeInDown.duration(300).delay(800)}>
            <Pressable onPress={handleCustomPress} hitSlop={16}>
              <Text style={[styles.customLink, { color: c.textMuted }]}>
                Or set your own intention...
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <PrimaryButton
          title="I'm ready"
          icon="arrow-forward"
          onPress={handleContinue}
          disabled={!selectedArea}
        />
      </View>

      <PaywallComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 32,
    alignSelf: 'flex-start',
  },

  // --- Emoji constellation ---
  constellation: {
    alignItems: 'center',
    gap: 20,
  },
  constellationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
  },
  emojiCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
  },
  emoji: {
    fontSize: 30,
  },

  // --- Response (label + affirmation revealed on select) ---
  responseSection: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 24,
    minHeight: 70,
  },
  selectedLabel: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  affirmationText: {
    fontFamily: typography.fontFamily.serifItalic,
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },

  spacer: {
    flex: 1,
  },

  // --- Custom link ---
  customLink: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },

  // --- Footer ---
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
});
