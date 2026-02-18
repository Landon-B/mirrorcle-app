import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { getMoodLabel, getMoodById, getQuadrantById, FEELING_COLORS, QUADRANTS } from '../../constants/feelings';
import { useColors } from '../../hooks/useColors';

/**
 * Renders horizontal bars for mood distribution.
 * Supports two modes:
 *   - Individual moods (default, limited to top 8)
 *   - Grouped by quadrant (4 bars)
 *
 * @param {{ moodId: string, count: number }[]} data - sorted descending by count
 */
export const MoodPatternChart = ({ data }) => {
  const c = useColors();
  const [viewMode, setViewMode] = useState('quadrant'); // 'quadrant' | 'individual'

  if (!data || data.length === 0) return null;

  // Group data by quadrant
  const quadrantData = QUADRANTS.map(q => {
    const total = data
      .filter(item => {
        const mood = getMoodById(item.moodId);
        return mood?.quadrant === q.id;
      })
      .reduce((sum, item) => sum + item.count, 0);
    return { quadrantId: q.id, label: q.label, color: q.colorPrimary, count: total };
  })
    .filter(q => q.count > 0)
    .sort((a, b) => b.count - a.count);

  // Individual: show top 8
  const individualData = data.slice(0, 8);
  const maxCount = viewMode === 'quadrant'
    ? (quadrantData[0]?.count || 1)
    : (individualData[0]?.count || 1);

  return (
    <View style={styles.container}>
      {/* View mode toggle */}
      <View style={styles.toggleRow}>
        <Pressable
          onPress={() => setViewMode('quadrant')}
          style={[
            styles.toggleButton,
            { borderColor: c.border },
            viewMode === 'quadrant' && { backgroundColor: c.accentRust, borderColor: c.accentRust },
          ]}
        >
          <Text style={[
            styles.toggleText,
            { color: c.textSecondary },
            viewMode === 'quadrant' && { color: '#FFFFFF' },
          ]}>
            Quadrants
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setViewMode('individual')}
          style={[
            styles.toggleButton,
            { borderColor: c.border },
            viewMode === 'individual' && { backgroundColor: c.accentRust, borderColor: c.accentRust },
          ]}
        >
          <Text style={[
            styles.toggleText,
            { color: c.textSecondary },
            viewMode === 'individual' && { color: '#FFFFFF' },
          ]}>
            Emotions
          </Text>
        </Pressable>
      </View>

      {/* Bars */}
      {viewMode === 'quadrant' ? (
        quadrantData.map((item, index) => (
          <QuadrantBar
            key={item.quadrantId}
            label={item.label}
            color={item.color}
            count={item.count}
            maxCount={maxCount}
            index={index}
          />
        ))
      ) : (
        individualData.map((item, index) => (
          <MoodBar
            key={item.moodId}
            moodId={item.moodId}
            count={item.count}
            maxCount={maxCount}
            index={index}
          />
        ))
      )}
    </View>
  );
};

const QuadrantBar = ({ label, color, count, maxCount, index }) => {
  const c = useColors();
  const percentage = count / maxCount;
  const barWidth = useSharedValue(0);

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
        <View style={[styles.colorDot, { backgroundColor: color }]} />
        <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
      </View>
      <View style={styles.barContainer}>
        <View style={[styles.barBackground, { backgroundColor: c.surfaceTertiary }]}>
          <Animated.View
            style={[styles.barFill, { backgroundColor: color }, barStyle]}
          />
        </View>
        <Text style={[styles.count, { color: c.textPrimary }]}>{count}</Text>
      </View>
    </View>
  );
};

const MoodBar = ({ moodId, count, maxCount, index }) => {
  const c = useColors();
  const percentage = count / maxCount;
  const barWidth = useSharedValue(0);
  const color = FEELING_COLORS[moodId] || c.accentRust;

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
        <View style={[styles.colorDot, { backgroundColor: color }]} />
        <Text style={[styles.label, { color: c.textSecondary }]}>{getMoodLabel(moodId)}</Text>
      </View>
      <View style={styles.barContainer}>
        <View style={[styles.barBackground, { backgroundColor: c.surfaceTertiary }]}>
          <Animated.View
            style={[styles.barFill, { backgroundColor: color }, barStyle]}
          />
        </View>
        <Text style={[styles.count, { color: c.textPrimary }]}>{count}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  barRow: {
    gap: 6,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
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
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  count: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'right',
  },
});
