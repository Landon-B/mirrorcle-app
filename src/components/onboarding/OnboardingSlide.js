import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const OnboardingSlide = ({ title, subtitle, icon, colors }) => (
  <View style={styles.slide}>
    <LinearGradient colors={colors} style={styles.iconWrapper}>
      <Ionicons name={icon} size={48} color="#fff" />
    </LinearGradient>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>
);

export const OnboardingDots = ({ total, current }) => (
  <View style={styles.dotsContainer}>
    {Array.from({ length: total }, (_, index) => (
      <View
        key={index}
        style={[
          styles.dot,
          index === current && styles.dotActive,
        ]}
      />
    ))}
  </View>
);

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
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    color: '#CBD5F5',
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
    backgroundColor: '#475569',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#C084FC',
  },
});
