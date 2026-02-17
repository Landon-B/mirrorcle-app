import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const OnboardingSlide = ({ title, subtitle, icon, colors }) => {
  const c = useColors();

  return (
    <View style={styles.slide}>
      <LinearGradient colors={colors} style={styles.iconWrapper}>
        <Ionicons name={icon} size={48} color="#fff" />
      </LinearGradient>
      <Text style={[styles.title, { color: c.textPrimary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: c.textSecondary }]}>{subtitle}</Text>
    </View>
  );
};

export const OnboardingDots = ({ total, current }) => {
  const c = useColors();

  return (
    <View style={styles.dotsContainer}>
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            { backgroundColor: c.border },
            index === current && [styles.dotActive, { backgroundColor: c.accentRust }],
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
});
