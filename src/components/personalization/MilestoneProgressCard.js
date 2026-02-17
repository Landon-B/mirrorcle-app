import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { shadows } from '../../styles/spacing';
import { useColors } from '../../hooks/useColors';

export const MilestoneProgressCard = ({ title, current, target, index = 0 }) => {
  const c = useColors();
  const percentage = Math.min(1, current / target);
  const barWidth = useSharedValue(0);

  useEffect(() => {
    barWidth.value = withDelay(
      200 + index * 150,
      withTiming(percentage, { duration: 600 })
    );
  }, [percentage]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value * 100}%`,
  }));

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]}>
      <Text style={[styles.title, { color: c.textPrimary }]}>{title}</Text>
      <View style={[styles.barBackground, { backgroundColor: c.surfaceTertiary }]}>
        <Animated.View style={[styles.barFill, { backgroundColor: c.accentRust }, barStyle]} />
      </View>
      <Text style={[styles.caption, { color: c.textMuted }]}>
        {current} of {target}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    minWidth: 180,
    ...shadows.card,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  barBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  caption: {
    fontSize: 12,
  },
});
