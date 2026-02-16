import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { AFFIRMATIONS, FALLBACK_AFFIRMATIONS } from '../constants';
import { ScreenHeader, PrimaryButton } from '../components/common';
import { typography } from '../styles/typography';
import { shadows } from '../styles/spacing';

export const BreathingPrepScreen = ({ navigation, route }) => {
  const { focusArea, mood } = route.params || {};

  // Pick a random affirmation to preview
  const previewAffirmation = useMemo(() => {
    if (AFFIRMATIONS && AFFIRMATIONS.length > 0) {
      const randomIndex = Math.floor(Math.random() * AFFIRMATIONS.length);
      return AFFIRMATIONS[randomIndex].text;
    }
    const randomIndex = Math.floor(Math.random() * FALLBACK_AFFIRMATIONS.length);
    return FALLBACK_AFFIRMATIONS[randomIndex];
  }, []);

  const handleReady = () => {
    navigation.navigate('Session', {
      focusArea,
      mood,
      firstAffirmation: previewAffirmation,
    });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        label="PREPARATION"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Focus area pill */}
        {focusArea && (
          <View style={styles.focusPill}>
            <Text style={styles.focusPillEmoji}>{focusArea.emoji}</Text>
            <Text style={styles.focusPillText}>{focusArea.label}</Text>
          </View>
        )}

        <Text style={styles.heading}>Take a deep breath.</Text>
        <Text style={styles.subtitle}>
          Ground yourself before we begin.
        </Text>

        {/* Affirmation preview card */}
        <View style={styles.affirmationCard}>
          <View style={styles.quoteMarkContainer}>
            <Text style={styles.quoteMark}>{'\u201C'}</Text>
          </View>
          <Text style={styles.affirmationText}>
            {previewAffirmation}
          </Text>
          <View style={styles.quoteMarkContainerEnd}>
            <Text style={styles.quoteMark}>{'\u201D'}</Text>
          </View>
        </View>

        <View style={styles.spacer} />

        {/* Footnote */}
        <Text style={styles.footnote}>
          You will be guided through a series of affirmations.{'\n'}
          Speak each one aloud while looking at yourself.
        </Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          title="I am ready"
          icon="arrow-forward"
          onPress={handleReady}
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  focusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 32,
    ...shadows.card,
  },
  focusPillEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  focusPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C17666',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2A26',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7A756E',
    textAlign: 'center',
    marginBottom: 40,
  },
  affirmationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 28,
    width: '100%',
    alignItems: 'center',
    ...shadows.cardLifted,
  },
  quoteMarkContainer: {
    alignSelf: 'flex-start',
    marginBottom: -4,
  },
  quoteMarkContainerEnd: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  quoteMark: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 36,
    color: '#E8D0C6',
    lineHeight: 40,
  },
  affirmationText: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 22,
    fontStyle: 'italic',
    color: '#2D2A26',
    textAlign: 'center',
    lineHeight: 32,
    paddingHorizontal: 8,
  },
  spacer: {
    flex: 1,
  },
  footnote: {
    fontSize: 13,
    color: '#B0AAA2',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
});
