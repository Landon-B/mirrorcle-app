import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { PrimaryButton } from '../common';
import { typography } from '../../styles/typography';
import { useColors } from '../../hooks/useColors';

const SHEET_HEIGHT = 220;
const SNAP_THRESHOLD = 80;

/**
 * Bottom sheet showing emotion detail after bubble selection.
 *
 * Props:
 *   emotion         — { id, label, definition, quadrant }
 *   validationText  — warm one-liner from MOOD_RESPONSES
 *   buttonTitle     — "Begin" or "Complete"
 *   onConfirm()     — called when button is pressed
 *   onDismiss()     — called when sheet is swiped down or backdrop tapped
 *   visible         — controls show/hide
 *   quadrantColor   — primary color of the selected quadrant
 */
export const EmotionBottomSheet = ({
  emotion,
  validationText,
  buttonTitle = 'Begin',
  onConfirm,
  onDismiss,
  visible,
  quadrantColor,
}) => {
  const c = useColors();
  const translateY = useSharedValue(SHEET_HEIGHT);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 22, stiffness: 180 });
    } else {
      translateY.value = withTiming(SHEET_HEIGHT, { duration: 250 });
    }
  }, [visible, translateY]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > SNAP_THRESHOLD) {
        translateY.value = withTiming(SHEET_HEIGHT, { duration: 200 });
        if (onDismiss) runOnJS(onDismiss)();
      } else {
        translateY.value = withSpring(0, { damping: 22, stiffness: 180 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!emotion) return null;

  return (
    <>
      {/* Backdrop */}
      {visible && (
        <Pressable
          style={styles.backdrop}
          onPress={onDismiss}
        />
      )}

      {/* Sheet */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, { backgroundColor: c.surface }, sheetStyle]}>
          {/* Drag handle */}
          <View style={[styles.handle, { backgroundColor: c.disabled }]} />

          {/* Emotion name */}
          <Text style={[styles.emotionLabel, { color: quadrantColor || c.accentRust }]}>
            {emotion.label}
          </Text>

          {/* Definition */}
          <Text style={[styles.definition, { color: c.textSecondary }]}>
            {emotion.definition}
          </Text>

          {/* Validation text */}
          {validationText ? (
            <Text style={[styles.validation, { color: c.textMuted }]}>
              {validationText}
            </Text>
          ) : null}

          {/* Confirm button */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={buttonTitle}
              icon="arrow-forward"
              onPress={onConfirm}
            />
          </View>
        </Animated.View>
      </GestureDetector>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: SHEET_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  emotionLabel: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  definition: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  validation: {
    fontFamily: typography.fontFamily?.serifItalic,
    fontStyle: 'italic',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 4,
  },
});
