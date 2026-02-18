import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
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
import { getMoodById, getMoodEmoji, MOODS, MOOD_FAMILIES, getMoodsForFamily, FEELING_COLORS } from '../constants/feelings';
import { personalizationService } from '../services/personalization';
import { sessionService } from '../services/session';
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

// --- Mood Shift Visualization ---
const MoodShiftSection = ({ preMood, postMood, colors: c }) => {
  const preMoodData = typeof preMood === 'string' ? getMoodById(preMood) : preMood;
  const postMoodData = postMood;

  if (!preMoodData || !postMoodData) return null;

  const preColor = FEELING_COLORS[preMoodData.id] || c.textMuted;
  const postColor = FEELING_COLORS[postMoodData.id] || c.textMuted;
  const isSameMood = preMoodData.id === postMoodData.id;

  return (
    <Animated.View
      entering={FadeInDown.delay(1000).duration(500)}
      style={styles.moodShiftContainer}
    >
      <View style={styles.moodRow}>
        <View style={[styles.moodShiftCircle, { borderColor: preColor, backgroundColor: c.surface }]}>
          <Text style={styles.moodShiftEmoji}>{preMoodData.emoji || getMoodEmoji(preMoodData.id)}</Text>
        </View>
        <Ionicons name="arrow-forward" size={16} color={c.disabled} />
        <View style={[styles.moodShiftCircle, { borderColor: postColor, backgroundColor: c.surface }]}>
          <Text style={styles.moodShiftEmoji}>{postMoodData.emoji}</Text>
        </View>
      </View>
      <Text style={[styles.moodNarrative, { color: c.textSecondary }]}>
        {isSameMood
          ? `You arrived ${preMoodData.label.toLowerCase()} \u2014 and honored that feeling.`
          : `${preMoodData.label} \u2192 ${postMoodData.label}`}
      </Text>
    </Animated.View>
  );
};

export const SuccessCelebrationScreen = ({ navigation, route }) => {
  const {
    completedPrompts = 0,
    duration = 0,
    feeling,
    preMood,
    focusArea,
  } = route.params || {};

  const { stats, user } = useApp();
  const { celebrationBurst, selectionTap } = useHaptics();
  const { checkNewMilestones } = usePersonalization();
  const c = useColors();

  // Inline mood state (two-layer: family → specific)
  const [selectedPostFamily, setSelectedPostFamily] = useState(null);
  const [selectedPostMood, setSelectedPostMood] = useState(null);
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection] = useState('');

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

  // Family selection (first tap)
  const handlePostFamilySelect = (familyId) => {
    selectionTap();
    setSelectedPostFamily(familyId);
    setSelectedPostMood(null);
  };

  // Specific mood selection (second tap)
  const handlePostMoodSelect = (moodId) => {
    selectionTap();
    setSelectedPostMood(moodId);

    // Record mood shift
    if (user?.id && feeling) {
      sessionService.recordMoodShift?.(user.id, feeling, moodId)
        .catch(err => console.log('Failed to record mood shift:', err));
    }
  };

  const handleBackToHome = () => {
    // Save reflection if present
    if (reflection.trim() && user?.id) {
      // Best-effort save
      sessionService.saveReflection?.(user.id, reflection.trim())
        .catch(() => {});
    }

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
  const postMoodData = selectedPostMood ? MOODS.find(m => m.id === selectedPostMood) : null;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <FloatingParticles count={20} opacity={0.5} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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

        {/* Inline mood selector (two-layer: families → specific) */}
        <Animated.View
          entering={FadeInDown.delay(800).duration(500)}
          style={styles.moodSection}
        >
          <Text style={[styles.moodQuestion, { color: c.textSecondary }]}>How do you feel now?</Text>

          {/* Family circles */}
          <View style={styles.moodEmojiRow}>
            {MOOD_FAMILIES.map((family) => {
              const isSelected = selectedPostFamily === family.id;
              return (
                <Pressable
                  key={family.id}
                  onPress={() => handlePostFamilySelect(family.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${family.label}`}
                  accessibilityState={{ selected: isSelected }}
                  style={[
                    styles.moodEmojiCircle,
                    { backgroundColor: c.surface },
                    isSelected && { borderColor: c.accentRust },
                  ]}
                >
                  <Text style={styles.moodEmojiText}>{family.emoji}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Specific feeling pills (appear after family selection) */}
          {selectedPostFamily && (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.moodPillRow}>
              {getMoodsForFamily(selectedPostFamily).map((mood) => {
                const isSelected = selectedPostMood === mood.id;
                return (
                  <Pressable
                    key={mood.id}
                    onPress={() => handlePostMoodSelect(mood.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${mood.label} mood`}
                    accessibilityState={{ selected: isSelected }}
                    style={[
                      styles.moodPill,
                      { backgroundColor: c.surface, borderColor: c.border },
                      isSelected && { borderColor: c.accentRust, backgroundColor: c.surfaceSecondary },
                    ]}
                  >
                    <Text style={styles.moodPillEmoji}>{mood.emoji}</Text>
                    <Text style={[
                      styles.moodPillLabel,
                      { color: c.textPrimary },
                      isSelected && { color: c.accentRust },
                    ]}>
                      {mood.label}
                    </Text>
                  </Pressable>
                );
              })}
            </Animated.View>
          )}
        </Animated.View>

        {/* Mood shift visualization (appears when mood selected) */}
        {postMoodData && (
          <MoodShiftSection preMood={preMood || feeling} postMood={postMoodData} colors={c} />
        )}

        {/* Optional reflection expander */}
        <Animated.View entering={FadeIn.delay(1200).duration(400)}>
          {!showReflection ? (
            <Pressable
              onPress={() => setShowReflection(true)}
              style={styles.reflectionTrigger}
            >
              <Text style={[styles.reflectionTriggerText, { color: c.accentRust }]}>Add a reflection...</Text>
            </Pressable>
          ) : (
            <View style={[styles.reflectionInputWrapper, { backgroundColor: c.surface }]}>
              <TextInput
                style={[styles.reflectionInput, { color: c.textPrimary }]}
                placeholder="What came up for you?"
                placeholderTextColor={c.inputPlaceholder}
                multiline
                maxLength={500}
                value={reflection}
                onChangeText={setReflection}
                autoFocus
              />
            </View>
          )}
        </Animated.View>

        {/* Session insight card */}
        <Animated.View
          entering={FadeInUp.delay(1400).duration(600)}
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

  // --- Inline mood selector ---
  moodSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  moodQuestion: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  moodEmojiRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  moodEmojiCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.card,
  },
  moodEmojiText: {
    fontSize: 22,
  },
  moodPillRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1.5,
  },
  moodPillEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  moodPillLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  // --- Mood shift ---
  moodShiftContainer: {
    alignItems: 'center',
    marginBottom: 20,
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

  // --- Reflection ---
  reflectionTrigger: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 20,
  },
  reflectionTriggerText: {
    fontSize: 14,
  },
  reflectionInputWrapper: {
    borderRadius: 16,
    marginBottom: 20,
    ...shadows.card,
  },
  reflectionInput: {
    minHeight: 80,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
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
