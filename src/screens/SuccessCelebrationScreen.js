import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import { PrimaryButton, FloatingParticles } from '../components/common';
import { PowerPhraseCard } from '../components/personalization/PowerPhraseCard';
import { GrowthNudgeCard } from '../components/personalization/GrowthNudgeCard';
import { typography } from '../styles/typography';
import { shadows } from '../styles/spacing';
import { useHaptics } from '../hooks/useHaptics';
import { getMoodById, getMoodEmoji, FEELING_COLORS } from '../constants/feelings';
import { personalizationService } from '../services/personalization';

const formatDuration = (seconds) => {
  if (!seconds || seconds < 60) return `${seconds || 0} seconds`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 1) return secs > 0 ? `1 minute ${secs}s` : '1 minute';
  return secs > 0 ? `${mins} minutes` : `${mins} minutes`;
};

const getStreakMessage = (streak, totalSessions) => {
  if ((!streak || streak === 0) && totalSessions > 0) return 'Life happens. What matters is you came back.';
  if (!streak || streak <= 1) return 'Every session is a step forward.';
  if (streak < 7) return `${streak} days of showing up for yourself.`;
  if (streak < 14) return `${streak} days of choosing yourself \u2014 that takes real courage.`;
  if (streak < 30) return `${streak} days strong. This practice is becoming part of who you are.`;
  return `${streak} days. You\u2019ve made self-reflection a way of life.`;
};

// --- Mood Shift Visualization ---
const MoodShiftSection = ({ preMood, postMood }) => {
  const preMoodData = typeof preMood === 'string' ? getMoodById(preMood) : preMood;
  const postMoodData = postMood;

  if (!preMoodData || !postMoodData) {
    // Fallback: no mood shift data
    return (
      <View style={styles.moodShiftFallback}>
        <Animated.View
          entering={FadeInDown.delay(200).springify().damping(12)}
          style={styles.sparkleCircle}
        >
          <Ionicons name="sparkles" size={32} color="#C17666" />
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(400).duration(500)} style={styles.heading}>
          You showed up for yourself today.
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(600).duration(500)} style={styles.subtitle}>
          That alone makes a difference.
        </Animated.Text>
      </View>
    );
  }

  const preColor = FEELING_COLORS[preMoodData.id] || '#B0AAA2';
  const postColor = FEELING_COLORS[postMoodData.id] || '#B0AAA2';
  const isSameMood = preMoodData.id === postMoodData.id;

  return (
    <View style={styles.moodShiftContainer}>
      {/* Emoji circles with arrow */}
      <View style={styles.moodRow}>
        <Animated.View
          entering={FadeInDown.delay(200).springify().damping(12)}
          style={[styles.moodCircle, { borderColor: preColor }]}
        >
          <Text style={styles.moodEmoji}>{preMoodData.emoji || getMoodEmoji(preMoodData.id)}</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(600).duration(400)}>
          <Ionicons name="arrow-forward" size={20} color="#D4CFC9" />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(800).springify().damping(12)}
          style={[styles.moodCircle, { borderColor: postColor }]}
        >
          <Text style={styles.moodEmoji}>{postMoodData.emoji}</Text>
        </Animated.View>
      </View>

      {/* Narrative text */}
      <Animated.Text entering={FadeIn.delay(1000).duration(500)} style={styles.moodNarrative}>
        {isSameMood
          ? `You arrived feeling ${preMoodData.label.toLowerCase()} \u2014 and you honored that feeling.`
          : `You arrived feeling ${preMoodData.label.toLowerCase()}. You\u2019re leaving feeling ${postMoodData.label.toLowerCase()}.`}
      </Animated.Text>
    </View>
  );
};

export const SuccessCelebrationScreen = ({ navigation, route }) => {
  const {
    completedPrompts = 0,
    duration = 0,
    feeling,
    preMood,
    postMood,
    reflection,
  } = route.params || {};

  const { stats, user } = useApp();
  const { celebrationBurst } = useHaptics();

  // Personalization data
  const [powerPhrase, setPowerPhrase] = useState(null);
  const [growthNudge, setGrowthNudge] = useState(null);

  useEffect(() => {
    celebrationBurst();

    // Load personalization data
    if (user?.id) {
      Promise.allSettled([
        personalizationService.getPowerPhrase(user.id),
        personalizationService.getGrowthNudge(user.id),
      ]).then(([phraseResult, nudgeResult]) => {
        if (phraseResult.status === 'fulfilled' && phraseResult.value) {
          setPowerPhrase(phraseResult.value);
        }
        if (nudgeResult.status === 'fulfilled' && nudgeResult.value) {
          setGrowthNudge(nudgeResult.value);
        }
      });
    }
  }, []);

  const handleBackToHome = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('HomeTab', { screen: 'Home' });
    } else {
      navigation.navigate('HomeTab', { screen: 'Home' });
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just completed a Mirrorcle session \u2014 ${completedPrompts} truths spoken about myself. My light is shining brighter.`,
      });
    } catch (error) {
      // User cancelled or share failed silently
    }
  };

  const streakMessage = getStreakMessage(stats.currentStreak, stats.totalSessions);

  return (
    <View style={styles.container}>
      {/* Floating particles behind content */}
      <FloatingParticles />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mood shift visualization */}
        <MoodShiftSection preMood={preMood || feeling} postMood={postMood} />

        {/* Session insight card */}
        <Animated.View
          entering={FadeInUp.delay(1200).duration(600)}
          style={styles.insightCard}
        >
          <Text style={styles.insightText}>
            You spoke{' '}
            <Text style={styles.insightBold}>{completedPrompts} truth{completedPrompts !== 1 ? 's' : ''}</Text>
            {' '}about yourself today
          </Text>
          <Text style={styles.insightDuration}>
            in {formatDuration(duration)} of presence
          </Text>

          <View style={styles.insightDivider} />

          <View style={styles.streakRow}>
            <Ionicons name="flame" size={16} color="#C17666" />
            <Text style={styles.streakText}>{streakMessage}</Text>
          </View>
        </Animated.View>

        {/* Reflection note (if user wrote one) */}
        {reflection && (
          <Animated.View
            entering={FadeIn.delay(1400).duration(500)}
            style={styles.reflectionCard}
          >
            <View style={styles.reflectionHeader}>
              <Ionicons name="create-outline" size={14} color="#B0AAA2" />
              <Text style={styles.reflectionLabel}>YOUR REFLECTION</Text>
            </View>
            <Text style={styles.reflectionText}>{reflection}</Text>
          </Animated.View>
        )}

        {/* Power phrase card */}
        {powerPhrase && (
          <Animated.View
            entering={FadeInUp.delay(1600).duration(500)}
            style={styles.personalizationCard}
          >
            <PowerPhraseCard
              text={powerPhrase.text}
              count={powerPhrase.count}
              colors={powerPhrase.colors}
            />
          </Animated.View>
        )}

        {/* Growth nudge card */}
        {growthNudge && (
          <Animated.View
            entering={FadeInUp.delay(1800).duration(500)}
            style={styles.personalizationCard}
          >
            <GrowthNudgeCard message={growthNudge.message} />
          </Animated.View>
        )}
      </ScrollView>

      {/* Footer actions */}
      <Animated.View
        entering={FadeIn.delay(2000).duration(400)}
        style={styles.footer}
      >
        <PrimaryButton
          title="Back to Home"
          icon="arrow-forward"
          onPress={handleBackToHome}
        />

        <Pressable
          onPress={handleShare}
          style={styles.shareButton}
          accessibilityRole="button"
          accessibilityLabel="Share your progress"
        >
          <Text style={styles.shareText}>SHARE YOUR PROGRESS</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2EE',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 24,
  },

  // --- Mood shift ---
  moodShiftContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  moodShiftFallback: {
    alignItems: 'center',
    marginBottom: 32,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  moodCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodNarrative: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 17,
    fontStyle: 'italic',
    color: '#7A756E',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 12,
  },

  // --- Fallback (no mood data) ---
  sparkleCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8D0C6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
    marginBottom: 12,
  },

  // --- Insight card ---
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    ...shadows.card,
  },
  insightText: {
    fontSize: 17,
    color: '#2D2A26',
    textAlign: 'center',
    lineHeight: 26,
  },
  insightBold: {
    fontWeight: '700',
    color: '#C17666',
  },
  insightDuration: {
    fontSize: 14,
    color: '#B0AAA2',
    marginTop: 4,
  },
  insightDivider: {
    width: '60%',
    height: 1,
    backgroundColor: '#F0ECE7',
    marginVertical: 16,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakText: {
    fontSize: 14,
    color: '#7A756E',
    fontStyle: 'italic',
  },

  // --- Reflection card ---
  reflectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...shadows.card,
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  reflectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#B0AAA2',
  },
  reflectionText: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 15,
    fontStyle: 'italic',
    color: '#2D2A26',
    lineHeight: 24,
  },

  // --- Personalization cards ---
  personalizationCard: {
    marginBottom: 16,
  },

  // --- Footer ---
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    alignItems: 'center',
  },
  shareButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  shareText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#C17666',
  },
});
