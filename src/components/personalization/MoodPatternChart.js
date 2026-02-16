import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { getMoodEmoji, getMoodLabel, FEELING_COLORS } from '../../constants/feelings';

/**
 * Renders horizontal bars for mood distribution.
 * @param {{ moodId: string, count: number }[]} data - sorted descending by count
 */
export const MoodPatternChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const maxCount = data[0].count;

  return (
    <View style={styles.container}>
      {data.map((item, index) => (
        <MoodBar
          key={item.moodId}
          moodId={item.moodId}
          count={item.count}
          maxCount={maxCount}
          index={index}
        />
      ))}
    </View>
  );
};

const MoodBar = ({ moodId, count, maxCount, index }) => {
  const percentage = count / maxCount;
  const barWidth = useSharedValue(0);
  const color = FEELING_COLORS[moodId] || '#C17666';

  useEffect(() => {
    barWidth.value = withDelay(
      100 + index * 80,
      withTiming(percentage, { duration: 500 })
    );
  }, [percentage]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value * 100}%`,
  }));

  return (
    <View style={styles.barRow}>
      <View style={styles.labelContainer}>
        <Text style={styles.emoji}>{getMoodEmoji(moodId)}</Text>
        <Text style={styles.label}>{getMoodLabel(moodId)}</Text>
      </View>
      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          <Animated.View
            style={[styles.barFill, { backgroundColor: color }, barStyle]}
          />
        </View>
        <Text style={styles.count}>{count}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  barRow: {
    gap: 6,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emoji: {
    fontSize: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7A756E',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F0ECE7',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  count: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D2A26',
    minWidth: 24,
    textAlign: 'right',
  },
});
