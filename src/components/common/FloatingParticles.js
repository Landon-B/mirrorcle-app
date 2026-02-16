import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DEFAULT_COLORS = ['#C17666', '#E8A090', '#D4A574', '#C9956B', '#E0BCA8'];

const Particle = ({ index, colors, maxOpacity }) => {
  const startX = useMemo(() => Math.random() * SCREEN_WIDTH, []);
  const size = useMemo(() => 4 + Math.random() * 4, []);
  const color = useMemo(() => colors[index % colors.length], [index, colors]);
  const duration = useMemo(() => 4000 + Math.random() * 3000, []);
  const swayAmount = useMemo(() => 20 + Math.random() * 30, []);
  const delay = useMemo(() => Math.random() * 3000, []);

  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-SCREEN_HEIGHT * 0.8, { duration, easing: Easing.linear }),
        -1,
        false
      )
    );
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(swayAmount, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(-swayAmount, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    opacity.value = withDelay(delay, withTiming(maxOpacity, { duration: 800 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const progress = Math.abs(translateY.value) / (SCREEN_HEIGHT * 0.8);
    const fadedOpacity = opacity.value * (1 - progress);
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
      ],
      opacity: Math.max(0, fadedOpacity),
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: -20,
          left: startX,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

export const FloatingParticles = ({
  count = 14,
  colors = DEFAULT_COLORS,
  opacity = 0.4,
}) => (
  <View style={styles.container} pointerEvents="none">
    {Array.from({ length: count }, (_, i) => (
      <Particle key={i} index={i} colors={colors} maxOpacity={opacity} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
});
