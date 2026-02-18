import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { QUADRANTS } from '../../constants/feelings';

/**
 * 2x2 grid of large colored circles for quadrant selection.
 * Layout: top-left=Charged, top-right=Bright, bottom-left=Deep, bottom-right=Tender
 *
 * Props:
 *   onSelect(quadrantId)  — called when a quadrant circle is tapped
 *   onUnsure()            — called when "I can't quite name it" is tapped
 *   hapticTap()           — haptic feedback function (optional)
 */
export const QuadrantGrid = ({ onSelect, onUnsure, hapticTap }) => {
  // Arrange quadrants in circumplex position:
  // top-left (charged), top-right (bright)
  // bottom-left (deep), bottom-right (tender)
  const topRow = [
    QUADRANTS.find(q => q.id === 'charged'),
    QUADRANTS.find(q => q.id === 'bright'),
  ];
  const bottomRow = [
    QUADRANTS.find(q => q.id === 'deep'),
    QUADRANTS.find(q => q.id === 'tender'),
  ];

  const handlePress = (quadrantId) => {
    hapticTap?.();
    onSelect(quadrantId);
  };

  return (
    <View style={styles.container}>
      {/* Top row */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(200).springify().damping(18)}
        style={styles.row}
      >
        {topRow.map((quadrant) => (
          <QuadrantCircle
            key={quadrant.id}
            quadrant={quadrant}
            onPress={() => handlePress(quadrant.id)}
          />
        ))}
      </Animated.View>

      {/* Bottom row */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(320).springify().damping(18)}
        style={styles.row}
      >
        {bottomRow.map((quadrant) => (
          <QuadrantCircle
            key={quadrant.id}
            quadrant={quadrant}
            onPress={() => handlePress(quadrant.id)}
          />
        ))}
      </Animated.View>

      {/* Axis labels */}
      <View style={styles.axisLabels}>
        <Text style={styles.axisLabel}>high energy</Text>
        <Text style={styles.axisLabel}>low energy</Text>
      </View>

      {/* "Not sure" escape hatch */}
      <Animated.View entering={FadeInDown.duration(300).delay(500)}>
        <Pressable onPress={onUnsure} hitSlop={16}>
          <Text style={styles.unsureLink}>I can't quite name it</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const QuadrantCircle = ({ quadrant, onPress }) => {
  const CIRCLE_SIZE = 148;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${quadrant.label} \u2014 ${quadrant.description}`}
      style={({ pressed }) => [
        styles.circleWrapper,
        pressed && styles.circlePressed,
      ]}
    >
      <LinearGradient
        colors={[quadrant.colorLight, quadrant.colorPrimary]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={[
          styles.circle,
          {
            width: CIRCLE_SIZE,
            height: CIRCLE_SIZE,
            borderRadius: CIRCLE_SIZE / 2,
          },
        ]}
      >
        <Text style={styles.circleLabel}>{quadrant.label}</Text>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
  },
  circleWrapper: {
    transform: [{ scale: 1 }],
  },
  circlePressed: {
    transform: [{ scale: 0.96 }],
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  circleLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  axisLabels: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
    marginTop: -8,
    opacity: 0,  // hidden — subtle enough without labels
  },
  axisLabel: {
    fontSize: 10,
    color: '#B0AAA2',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  unsureLink: {
    fontSize: 14,
    color: '#B0AAA2',
    textAlign: 'center',
    marginTop: 8,
  },
});
