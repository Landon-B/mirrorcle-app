import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AFFIRMATIONS } from '../constants';
import { FALLBACK_AFFIRMATIONS } from '../constants';

const COLORS = {
  background: '#F5F2EE',
  textPrimary: '#2D2A26',
  textMuted: '#B0AAA2',
  accent: '#C17666',
  cardBackground: '#FFFFFF',
};

const serifItalic = {
  fontFamily: Platform.OS === 'ios' ? 'Georgia-Italic' : 'serif',
  fontStyle: 'italic',
};

export const WelcomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const affirmationText = useMemo(() => {
    if (AFFIRMATIONS && AFFIRMATIONS.length > 0) {
      const index = Math.floor(Math.random() * AFFIRMATIONS.length);
      return AFFIRMATIONS[index].text;
    }
    const index = Math.floor(Math.random() * FALLBACK_AFFIRMATIONS.length);
    return FALLBACK_AFFIRMATIONS[index];
  }, []);

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.container}>
        {/* Brand */}
        <View style={styles.brandSection}>
          <Text style={styles.brandTitle}>Mirrorcle</Text>
          <Text style={styles.brandSubtitle}>REFLECT. EVOLVE. REPEAT.</Text>
        </View>

        {/* Affirmation Card */}
        <View style={styles.cardWrapper}>
          <View style={styles.card}>
            <Text style={styles.quoteMark}>{'\u201C'}</Text>
            <Text style={styles.cardText}>{affirmationText}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionSection}>
          <Pressable
            onPress={() => navigation.navigate('Onboarding')}
            accessibilityRole="button"
            accessibilityLabel="Begin my journey"
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && styles.ctaButtonPressed,
            ]}
          >
            <Text style={styles.ctaButtonText}>Begin my journey</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            style={styles.signInButton}
          >
            <Text style={styles.signInText}>ALREADY A MEMBER? SIGN IN</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },

  /* Brand */
  brandSection: {
    alignItems: 'center',
    marginTop: 48,
  },
  brandTitle: {
    fontSize: 48,
    color: COLORS.textPrimary,
    ...serifItalic,
    marginBottom: 10,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: COLORS.textMuted,
  },

  /* Affirmation Card */
  cardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingTop: 28,
    paddingBottom: 36,
    width: '100%',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  quoteMark: {
    fontSize: 56,
    color: COLORS.textMuted,
    ...serifItalic,
    lineHeight: 56,
    marginBottom: 4,
    opacity: 0.4,
  },
  cardText: {
    fontSize: 24,
    color: COLORS.textPrimary,
    ...serifItalic,
    textAlign: 'center',
    lineHeight: 34,
  },

  /* Actions */
  actionSection: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  ctaButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
  },
  ctaButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  signInButton: {
    paddingVertical: 8,
  },
  signInText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: COLORS.textMuted,
  },
});
