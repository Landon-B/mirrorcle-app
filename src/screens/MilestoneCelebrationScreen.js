import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../components/common';
import { typography } from '../styles/typography';
import { shadows } from '../styles/spacing';

const MILESTONE_CONFIG = {
  first_session: {
    icon: 'sparkles',
    title: 'First Step Taken',
    message: 'You just completed your very first mirror session. This is the beginning of something beautiful.',
    emoji: '',
  },
  ten_sessions: {
    icon: 'flame',
    title: 'On Fire',
    message: 'Ten sessions in. You are building a practice that will transform how you see yourself.',
    emoji: '',
  },
  fifty_sessions: {
    icon: 'trophy',
    title: 'Dedicated Practitioner',
    message: 'Fifty sessions of speaking truth to yourself. Your consistency is inspiring.',
    emoji: '',
  },
  hundred_affirmations: {
    icon: 'diamond',
    title: 'Words of Power',
    message: 'One hundred affirmations spoken with intention. Each one planted a seed of change.',
    emoji: '',
  },
  seven_day_streak: {
    icon: 'calendar',
    title: 'One Week Strong',
    message: 'Seven days in a row. Habits are forming and your mirror is becoming a sanctuary.',
    emoji: '',
  },
  thirty_day_streak: {
    icon: 'medal',
    title: 'Unstoppable',
    message: 'Thirty consecutive days. Your dedication to self-reflection is extraordinary.',
    emoji: '',
  },
  first_favorite: {
    icon: 'heart',
    title: 'Found a Favorite',
    message: 'You saved your first affirmation. Return to it whenever you need a reminder.',
    emoji: '',
  },
  all_feelings_explored: {
    icon: 'color-palette',
    title: 'Emotional Explorer',
    message: 'You have explored every emotion in Mirrorcle. Self-awareness is a superpower.',
    emoji: '',
  },
  custom_affirmation_created: {
    icon: 'create',
    title: 'Your Own Words',
    message: 'You wrote your first custom affirmation. No one knows what you need to hear better than you.',
    emoji: '',
  },
};

const DEFAULT_MILESTONE = {
  icon: 'star',
  title: 'Achievement Unlocked',
  message: 'You reached a new milestone on your self-reflection journey.',
  emoji: '',
};

export const MilestoneCelebrationScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { milestoneKey, themeUnlocked } = route.params || {};

  const config = MILESTONE_CONFIG[milestoneKey] || DEFAULT_MILESTONE;

  const handleDismiss = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      <View style={styles.content}>
        {/* Decorative circle */}
        <View style={styles.iconCircle}>
          <Ionicons name={config.icon} size={36} color="#C17666" />
        </View>

        <Text style={styles.emoji}>{config.emoji}</Text>

        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.message}>{config.message}</Text>

        {themeUnlocked && (
          <View style={styles.unlockBadge}>
            <Ionicons name="color-palette" size={16} color="#C17666" />
            <Text style={styles.unlockText}>
              New theme unlocked: {themeUnlocked}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <PrimaryButton
          title="Keep Going"
          icon="arrow-forward"
          onPress={handleDismiss}
        />

        <Pressable onPress={handleDismiss} style={styles.dismissButton}>
          <Text style={styles.dismissText}>DISMISS</Text>
        </Pressable>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8D0C6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2A26',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 17,
    color: '#7A756E',
    textAlign: 'center',
    lineHeight: 26,
  },
  unlockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginTop: 28,
    gap: 8,
    ...shadows.card,
  },
  unlockText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C17666',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: 'center',
  },
  dismissButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  dismissText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#B0AAA2',
  },
});
