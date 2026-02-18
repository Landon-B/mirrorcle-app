import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  FadeIn,
} from 'react-native-reanimated';
import { packCircles, bubbleSizeToRadius } from '../../utils/circlePacking';
import { getQuadrantById, getMoodsForQuadrant, getFeelingColor } from '../../constants/feelings';

const CONTAINER_PADDING = 12;

/**
 * Packed bubble-cloud picker for emotions within a quadrant.
 *
 * Props:
 *   quadrantId     — which quadrant's emotions to show
 *   selectedId     — currently selected emotion id (or null)
 *   onSelect(id)   — called when a bubble is tapped
 *   containerWidth — available width (from onLayout)
 *   containerHeight — available height (from onLayout)
 */
export const BubbleCloud = ({
  quadrantId,
  selectedId,
  onSelect,
  containerWidth = 360,
  containerHeight = 420,
}) => {
  const quadrant = getQuadrantById(quadrantId);
  const emotions = getMoodsForQuadrant(quadrantId);

  // Compute circle positions
  const packedCircles = useMemo(() => {
    const circles = emotions.map(e => ({
      id: e.id,
      radius: bubbleSizeToRadius(e.bubbleSize),
    }));
    return packCircles(
      circles,
      containerWidth - CONTAINER_PADDING * 2,
      containerHeight - CONTAINER_PADDING * 2,
      8,
    );
  }, [emotions, containerWidth, containerHeight]);

  return (
    <View
      style={[
        styles.container,
        {
          width: containerWidth,
          height: containerHeight,
        },
      ]}
    >
      {packedCircles.map((circle, index) => {
        const emotion = emotions.find(e => e.id === circle.id);
        if (!emotion) return null;

        return (
          <Bubble
            key={circle.id}
            emotion={emotion}
            x={circle.x + CONTAINER_PADDING}
            y={circle.y + CONTAINER_PADDING}
            radius={circle.radius}
            index={index}
            isSelected={selectedId === circle.id}
            hasSelection={selectedId !== null}
            quadrantColor={quadrant?.colorPrimary}
            onPress={() => onSelect(circle.id)}
          />
        );
      })}
    </View>
  );
};

/**
 * Individual bubble circle with selection animation.
 */
const Bubble = React.memo(({
  emotion,
  x,
  y,
  radius,
  index,
  isSelected,
  hasSelection,
  quadrantColor,
  onPress,
}) => {
  const color = getFeelingColor(emotion.id);
  const diameter = radius * 2;

  // Selection animation values
  const scale = useSharedValue(0);
  const borderRadius = useSharedValue(radius);
  const opacity = useSharedValue(1);

  // Idle floating — subtle Y oscillation
  const floatOffset = useSharedValue(0);

  // Entrance animation — staggered spring (runs once on mount)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    scale.value = withDelay(
      index * 60,
      withSpring(1, { damping: 14, stiffness: 120 })
    );
    floatOffset.value = withDelay(
      index * 200,
      withRepeat(
        withTiming(1, { duration: 2800 + index * 100 }),
        -1,
        true,
      ),
    );
  }, []);

  // Selection state changes — only react to selection props
  React.useEffect(() => {
    if (isSelected) {
      borderRadius.value = withTiming(radius * 0.3, { duration: 200 });
      scale.value = withSpring(1.12, { damping: 14, stiffness: 140 });
      opacity.value = withTiming(1, { duration: 150 });
    } else if (hasSelection) {
      borderRadius.value = withTiming(radius, { duration: 200 });
      scale.value = withSpring(0.88, { damping: 18, stiffness: 160 });
      opacity.value = withTiming(0.35, { duration: 200 });
    } else {
      borderRadius.value = withTiming(radius, { duration: 200 });
      scale.value = withSpring(1, { damping: 14, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 200 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected, hasSelection, radius]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: floatOffset.value * 3 - 1.5 },
    ],
    borderRadius: borderRadius.value,
    opacity: opacity.value,
  }));

  // Font size scales with bubble size
  const fontSize = radius >= 48 ? 14 : radius >= 36 ? 12 : 10;

  return (
    <Animated.View
      style={[
        styles.bubbleWrapper,
        {
          left: x - radius,
          top: y - radius,
          width: diameter,
          height: diameter,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${emotion.label} \u2014 ${emotion.definition}`}
        accessibilityState={{ selected: isSelected }}
        style={[
          styles.bubble,
          {
            width: diameter,
            height: diameter,
            backgroundColor: color,
          },
        ]}
      >
        <Text
          style={[
            styles.bubbleLabel,
            { fontSize },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {emotion.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
  },
  bubbleWrapper: {
    position: 'absolute',
    overflow: 'hidden',
  },
  bubble: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  bubbleLabel: {
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 4,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
