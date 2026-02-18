import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { AFFIRMATIONS, FALLBACK_AFFIRMATIONS } from '../constants';
import { ScreenHeader, PrimaryButton } from '../components/common';
import { typography } from '../styles/typography';
import { shadows } from '../styles/spacing';
import { useColors } from '../hooks/useColors';

export const BreathingPrepScreen = ({ navigation, route }) => {
  const { focusArea, mood } = route.params || {};
  const c = useColors();

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
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScreenHeader
        label="PREPARATION"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Focus area pill */}
        {focusArea && (
          <Animated.View
            entering={FadeInDown.duration(400).delay(100)}
            style={[styles.focusPill, { backgroundColor: c.surface }]}
          >
            <Text style={styles.focusPillEmoji}>{focusArea.emoji}</Text>
            <Text style={[styles.focusPillText, { color: c.accentRust }]}>{focusArea.label}</Text>
          </Animated.View>
        )}

        {/* Centering prompt */}
        <Animated.Text
          entering={FadeIn.duration(600).delay(200)}
          style={[styles.centeringText, { color: c.textSecondary }]}
        >
          Take a moment to settle in.
        </Animated.Text>

        {/* Affirmation preview card */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(400).springify().damping(18)}
          style={[styles.affirmationCard, { backgroundColor: c.surface }]}
        >
          <View style={styles.quoteMarkContainer}>
            <Text style={[styles.quoteMark, { color: c.accentPeach }]}>{'\u201C'}</Text>
          </View>
          <Text style={[styles.affirmationText, { color: c.textPrimary }]}>
            {previewAffirmation}
          </Text>
          <View style={styles.quoteMarkContainerEnd}>
            <Text style={[styles.quoteMark, { color: c.accentPeach }]}>{'\u201D'}</Text>
          </View>
        </Animated.View>

        <Animated.Text
          entering={FadeIn.duration(400).delay(700)}
          style={[styles.hintText, { color: c.textMuted }]}
        >
          You'll speak this aloud in the mirror.
        </Animated.Text>

        <View style={styles.spacer} />
      </View>

      {/* Ready button */}
      <Animated.View
        entering={FadeIn.duration(400).delay(600)}
        style={styles.footer}
      >
        <PrimaryButton
          title="I am ready"
          icon="arrow-forward"
          onPress={handleReady}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  focusPill: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  centeringText: {
    fontSize: 17,
    fontFamily: typography.fontFamily.serifItalic,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  affirmationCard: {
    borderRadius: 24,
    paddingVertical: 28,
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
    lineHeight: 40,
  },
  affirmationText: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 22,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 32,
    paddingHorizontal: 8,
  },
  hintText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
});
