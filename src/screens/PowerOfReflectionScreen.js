import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader, PrimaryButton } from '../components/common';
import { typography } from '../styles/typography';
import { shadows } from '../styles/spacing';

const BENEFITS = [
  {
    icon: 'eye-outline',
    title: 'See Yourself',
    description: 'Looking at your own reflection while speaking creates a deeper connection with your words.',
  },
  {
    icon: 'mic-outline',
    title: 'Speak with Intention',
    description: 'Hearing yourself say affirmations aloud activates different neural pathways than reading silently.',
  },
  {
    icon: 'repeat-outline',
    title: 'Build a Practice',
    description: 'Consistent daily reflection rewires your self-perception over time.',
  },
  {
    icon: 'heart-outline',
    title: 'Cultivate Self-Love',
    description: 'Mirror work is one of the most powerful tools for developing a compassionate relationship with yourself.',
  },
];

export const PowerOfReflectionScreen = ({ navigation, route }) => {
  const { onContinue } = route.params || {};

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        label="HOW IT WORKS"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>The Power of{'\n'}Mirror Reflection</Text>
        <Text style={styles.subtitle}>
          Science-backed practice for personal growth
        </Text>

        {/* Quote card */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>
            {'\u201C'}The mirror reflects all objects without being sullied.{'\u201D'}
          </Text>
          <Text style={styles.quoteAuthor}>{'\u2014'} Confucius</Text>
        </View>

        {/* Benefits */}
        {BENEFITS.map((benefit, index) => (
          <View key={index} style={styles.benefitRow}>
            <View style={styles.benefitIcon}>
              <Ionicons name={benefit.icon} size={22} color="#C17666" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>{benefit.title}</Text>
              <Text style={styles.benefitDescription}>{benefit.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="I'm Ready to Begin"
          icon="arrow-forward"
          onPress={handleContinue}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2EE',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2A26',
    lineHeight: 36,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7A756E',
    marginBottom: 28,
  },
  quoteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 24,
    marginBottom: 32,
    alignItems: 'center',
    ...shadows.card,
  },
  quoteText: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 18,
    fontStyle: 'italic',
    color: '#2D2A26',
    textAlign: 'center',
    lineHeight: 28,
  },
  quoteAuthor: {
    fontSize: 13,
    color: '#B0AAA2',
    marginTop: 10,
  },
  benefitRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8D0C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitContent: {
    flex: 1,
    paddingTop: 2,
  },
  benefitTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2D2A26',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#7A756E',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
});
