import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { shadows } from '../../styles/spacing';

export const MilestoneProgressCard = ({ title, current, target, index = 0 }) => {
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
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.barBackground}>
        <Animated.View style={[styles.barFill, barStyle]} />
      </View>
      <Text style={styles.caption}>
        {current} of {target}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    minWidth: 180,
    ...shadows.card,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D2A26',
    marginBottom: 10,
  },
  barBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0ECE7',
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#C17666',
  },
  caption: {
    fontSize: 12,
    color: '#B0AAA2',
  },
});
