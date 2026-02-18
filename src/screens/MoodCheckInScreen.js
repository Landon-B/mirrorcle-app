import React, { useCallback } from 'react';
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
import { MOOD_RESPONSES } from '../constants/feelings';
import { ScreenHeader, PrimaryButton } from '../components/common';
import { QuadrantGrid } from '../components/mood/QuadrantGrid';
import { BubbleCloud } from '../components/mood/BubbleCloud';
import { EmotionBottomSheet } from '../components/mood/EmotionBottomSheet';
import { BubbleSearchOverlay } from '../components/mood/BubbleSearchOverlay';
import { useMoodPicker } from '../hooks/useMoodPicker';
import { useHaptics } from '../hooks/useHaptics';
import { useColors } from '../hooks/useColors';
import { moodPickerStyles } from '../styles/moodPickerStyles';

export const MoodCheckInScreen = ({ navigation, route }) => {
  const { focusArea } = route.params || {};
  const { selectionTap, successPulse, breathingPulse } = useHaptics();
  const c = useColors();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const {
    step,
    selectedQuadrant,
    selectedEmotion,
    searchVisible,
    setSearchVisible,
    handleQuadrantSelect,
    handleUnsure,
    handleBubbleSelect,
    handleBubbleDeselect,
    handleSearchSelect,
    handleBack,
    quadrant,
  } = useMoodPicker({ breathingPulse, successPulse });

  // --- Handlers ---

  const handleConfirm = useCallback(() => {
    if (!selectedEmotion) return;
    successPulse();
    navigation.navigate('Session', {
      focusArea,
      mood: selectedEmotion,
    });
  }, [selectedEmotion, navigation, focusArea, successPulse]);

  // --- Derived ---

  const heading = step === 'unsure'
    ? 'That\u2019s okay.'
    : step === 'bubbles'
      ? 'What fits closest?'
      : 'Tap the color closest\nto how you feel';

  const subtitle = step === 'unsure'
    ? 'You showed up. That\u2019s what matters.'
    : step === 'bubbles'
      ? quadrant?.description || ''
      : 'No judgment. Just noticing.';

  const validationText = selectedEmotion
    ? (MOOD_RESPONSES[selectedEmotion.id] || '')
    : '';

  // Bubble cloud dimensions — fill available space
  const cloudWidth = windowWidth - 24;
  const cloudHeight = Math.min(windowHeight * 0.52, 460);

  return (
    <View style={[moodPickerStyles.container, { backgroundColor: c.background }]}>
      <ScreenHeader
        label="CHECK-IN"
        onBack={() => handleBack(() => navigation.goBack())}
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
      <View style={moodPickerStyles.headingContainer}>
        <Animated.Text
          key={`heading-${step}-${selectedQuadrant || ''}`}
          entering={FadeInDown.duration(400).delay(100)}
          style={[moodPickerStyles.heading, { color: c.textPrimary }]}
        >
          {heading}
        </Animated.Text>

        <Animated.Text
          key={`subtitle-${step}-${selectedQuadrant || ''}`}
          entering={FadeInDown.duration(350).delay(200)}
          style={[moodPickerStyles.subtitle, { color: c.textSecondary }]}
        >
          {subtitle}
        </Animated.Text>
      </View>

      {/* Step 1: Quadrant selection */}
      {step === 'quadrant' && (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          style={moodPickerStyles.contentArea}
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
          style={moodPickerStyles.contentArea}
        >
          {/* Quadrant badge */}
          {quadrant && (
            <View style={[moodPickerStyles.quadrantBadge, { backgroundColor: quadrant.colorLight }]}>
              <View style={[moodPickerStyles.quadrantDot, { backgroundColor: quadrant.colorPrimary }]} />
              <Text style={[moodPickerStyles.quadrantBadgeLabel, { color: quadrant.colorDark }]}>
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
          style={moodPickerStyles.unsureSection}
        >
          <Text style={moodPickerStyles.unsureEmoji}>{'\uD83E\uDD0D'}</Text>
          <Text style={[moodPickerStyles.unsureValidation, { color: c.accentRust }]}>
            {MOOD_RESPONSES.unsure}
          </Text>

          <View style={moodPickerStyles.unsureButton}>
            <PrimaryButton
              title="Begin"
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
          buttonTitle="Begin"
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

// --- Screen-specific styles ---

const styles = StyleSheet.create({
  searchButton: {
    padding: 8,
  },
});
