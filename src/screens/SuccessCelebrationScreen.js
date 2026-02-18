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
import { usePersonalization } from '../hooks/usePersonalization';
import { getMoodById, getMoodEmoji, FEELING_COLORS } from '../constants/feelings';
import { personalizationService } from '../services/personalization';
import { useColors } from '../hooks/useColors';

const THEME_UNLOCK_MAP = {
  seven_day_streak: 'Sunset Glow',
  thirty_day_streak: 'Rose Garden',
};

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

const getOrdinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// --- Mood Visualization ---
// Handles three scenarios: pre+post shift, pre-only, post-only
const MoodSection = ({ preMood, postMood, colors: c }) => {
  const preMoodData = typeof preMood === 'string' ? getMoodById(preMood) : preMood;
  const postMoodData = typeof postMood === 'string' ? getMoodById(postMood) : postMood;

  // Both moods available \u2014 show shift visualization
  if (preMoodData && postMoodData) {
    const preColor = FEELING_COLORS[preMoodData.id] || c.textMuted;
    const postColor = FEELING_COLORS[postMoodData.id] || c.textMuted;
    const isSameMood = preMoodData.id === postMoodData.id;

    return (
      <Animated.View
        entering={FadeInDown.delay(600).duration(500)}
        style={styles.moodShiftContainer}
      >
        <View style={styles.moodRow}>
          <View style={[styles.moodShiftCircle, { borderColor: preColor, backgroundColor: c.surface }]}>
            <Text style={styles.moodShiftEmoji}>{preMoodData.emoji || getMoodEmoji(preMoodData.id)}</Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color={c.disabled} />
          <View style={[styles.moodShiftCircle, { borderColor: postColor, backgroundColor: c.surface }]}>
            <Text style={styles.moodShiftEmoji}>{postMoodData.emoji || getMoodEmoji(postMoodData.id)}</Text>
          </View>
        </View>
        <Text style={[styles.moodNarrative, { color: c.textSecondary }]}>
          {isSameMood
            ? `You arrived ${preMoodData.label.toLowerCase()} \u2014 and honored that feeling.`
            : `${preMoodData.label} \u2192 ${postMoodData.label}`}
        </Text>
      </Animated.View>
    );
  }

  // Pre-mood only \u2014 user skipped post-session check-in
  if (preMoodData && !postMoodData) {
    const preColor = FEELING_COLORS[preMoodData.id] || c.textMuted;

    return (
      <Animated.View
        entering={FadeInDown.delay(600).duration(500)}
        style={styles.moodShiftContainer}
      >
        <View style={[styles.moodShiftCircle, { borderColor: preColor, backgroundColor: c.surface, alignSelf: 'center' }]}>
          <Text style={styles.moodShiftEmoji}>{preMoodData.emoji || getMoodEmoji(preMoodData.id)}</Text>
        </View>
        <Text style={[styles.moodNarrative, { color: c.textSecondary, marginTop: 8 }]}>
          You arrived feeling {preMoodData.label.toLowerCase()} \u2014 and you still showed up.
        </Text>
      </Animated.View>
    );
  }

  // Post-mood only \u2014 pre-mood wasn't recorded
  if (!preMoodData && postMoodData) {
    const postColor = FEELING_COLORS[postMoodData.id] || c.textMuted;

    return (
      <Animated.View
        entering={FadeInDown.delay(600).duration(500)}
        style={styles.moodShiftContainer}
      >
        <View style={[styles.moodShiftCircle, { borderColor: postColor, backgroundColor: c.surface, alignSelf: 'center' }]}>
          <Text style={styles.moodShiftEmoji}>{postMoodData.emoji || getMoodEmoji(postMoodData.id)}</Text>
        </View>
        <Text style={[styles.moodNarrative, { color: c.textSecondary, marginTop: 8 }]}>
          You're leaving feeling {postMoodData.label.toLowerCase()}. That's real.
        </Text>
      </Animated.View>
    );
  }

  return null;
};

export const SuccessCelebrationScreen = ({ navigation, route }) => {
  const {
    completedPrompts = 0,
    duration = 0,
    feeling,
    preMood,
    postMood,
    reflection,
    focusArea,
  } = route.params || {};

  const { stats, user } = useApp();
  const { celebrationBurst } = useHaptics();
  const { checkNewMilestones } = usePersonalization();
  const c = useColors();

  // Personalization data
  const [powerPhrase, setPowerPhrase] = useState(null);
  const [growthNudge, setGrowthNudge] = useState(null);
  const [newMilestones, setNewMilestones] = useState([]);

  useEffect(() => {
    celebrationBurst();

    if (user?.id) {
      Promise.allSettled([
        personalizationService.getPowerPhrase(user.id),
        personalizationService.getGrowthNudge(user.id),
        checkNewMilestones(),
      ]).then(([phraseResult, nudgeResult, milestoneResult]) => {
        if (phraseResult.status === 'fulfilled' && phraseResult.value) {
          setPowerPhrase(phraseResult.value);
        }
        if (nudgeResult.status === 'fulfilled' && nudgeResult.value) {
          setGrowthNudge(nudgeResult.value);
        }
        if (milestoneResult.status === 'fulfilled' && milestoneResult.value?.length > 0) {
          setNewMilestones(milestoneResult.value);
        }
      });
    }
  }, []);

  const handleDone = () => {
    // If milestones were earned, show celebration modal first
    if (newMilestones.length > 0) {
      const milestone = newMilestones[0];
      setNewMilestones(prev => prev.slice(1));
      const rootNav = navigation.getParent()?.getParent() || navigation.getParent() || navigation;
      rootNav.navigate('MilestoneCelebration', {
        milestoneKey: milestone.key,
        themeUnlocked: THEME_UNLOCK_MAP[milestone.key] || null,
        fromSession: true,
      });
      return;
    }

    // Pop back to the affirmation wheel (root of the stack)
    navigation.popToTop();
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
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <FloatingParticles count={20} opacity={0.5} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Lead emotional statement */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(600)}
          style={styles.heroSection}
        >
          <View style={[styles.sparkleCircle, { backgroundColor: c.accentPeach }]}>
            <Ionicons name="sparkles" size={32} color={c.accentRust} />
          </View>
          <Text style={[styles.heroText, { color: c.textPrimary }]}>
            {completedPrompts} truth{completedPrompts !== 1 ? 's' : ''} spoken.{'\n'}You showed up.
          </Text>
        </Animated.View>

        {/* Mood visualization — shows shift, pre-only, or post-only */}
        {(preMood || feeling || postMood) && (
          <MoodSection preMood={preMood || feeling} postMood={postMood} colors={c} />
        )}

        {/* Reflection display (read-only, from PostMoodReflection) */}
        {reflection ? (
          <Animated.View
            entering={FadeIn.delay(800).duration(400)}
            style={[styles.reflectionDisplay, { backgroundColor: c.surface }]}
          >
            <Text style={[styles.reflectionQuote, { color: c.textSecondary }]}>
              &ldquo;{reflection}&rdquo;
            </Text>
          </Animated.View>
        ) : null}

        {/* Session insight card */}
        <Animated.View
          entering={FadeInUp.delay(1000).duration(600)}
          style={[styles.insightCard, { backgroundColor: c.surface }]}
        >
          <Text style={[styles.insightText, { color: c.textPrimary }]}>
            You spoke{' '}
            <Text style={[styles.insightBold, { color: c.accentRust }]}>{completedPrompts} truth{completedPrompts !== 1 ? 's' : ''}</Text>
            {' '}about yourself today
          </Text>
          <Text style={[styles.insightDuration, { color: c.textMuted }]}>
            in {formatDuration(duration)} of presence
          </Text>

          <View style={[styles.insightDivider, { backgroundColor: c.surfaceTertiary }]} />

          <View style={styles.streakRow}>
            <Ionicons name="flame" size={16} color={c.accentRust} />
            <Text style={[styles.streakText, { color: c.textSecondary }]}>{streakMessage}</Text>
          </View>

          {/* Day-to-day continuity */}
          {stats.totalSessions > 1 && (
            <Text style={[styles.continuityText, { color: c.textMuted }]}>
              Your {getOrdinal(stats.totalSessions)} session.
            </Text>
          )}
        </Animated.View>

        {/* Power phrase card */}
        {powerPhrase && (
          <Animated.View
            entering={FadeInUp.delay(1200).duration(500)}
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
            entering={FadeInUp.delay(1400).duration(500)}
            style={styles.personalizationCard}
          >
            <GrowthNudgeCard message={growthNudge.message} />
          </Animated.View>
        )}
      </ScrollView>

      {/* Footer actions */}
      <Animated.View
        entering={FadeIn.delay(1600).duration(400)}
        style={styles.footer}
      >
        <PrimaryButton
          title="Done"
          icon="checkmark"
          onPress={handleDone}
        />

        <Pressable
          onPress={handleShare}
          style={styles.shareButton}
          accessibilityRole="button"
          accessibilityLabel="Share your progress"
        >
          <Text style={[styles.shareText, { color: c.accentRust }]}>SHARE YOUR PROGRESS</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 24,
  },

  // --- Hero section ---
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  sparkleCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroText: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 28,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 38,
  },

  // --- Mood shift ---
  moodShiftContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  moodShiftCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodShiftEmoji: {
    fontSize: 22,
  },
  moodNarrative: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // --- Reflection display ---
  reflectionDisplay: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    ...shadows.card,
  },
  reflectionQuote: {
    fontFamily: typography.fontFamily.serifItalic,
    fontStyle: 'italic',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },

  // --- Insight card ---
  insightCard: {
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
    textAlign: 'center',
    lineHeight: 26,
  },
  insightBold: {
    fontWeight: '700',
  },
  insightDuration: {
    fontSize: 14,
    marginTop: 4,
  },
  insightDivider: {
    width: '60%',
    height: 1,
    marginVertical: 16,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  continuityText: {
    fontSize: 14,
    marginTop: 8,
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
  },
});
