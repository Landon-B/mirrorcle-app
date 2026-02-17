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
import { getMoodById, getMoodEmoji, MOODS, FEELING_COLORS } from '../constants/feelings';
import { personalizationService } from '../services/personalization';
import { sessionService } from '../services/session';

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
const MoodShiftSection = ({ preMood, postMood }) => {
  const preMoodData = typeof preMood === 'string' ? getMoodById(preMood) : preMood;
  const postMoodData = postMood;

  if (!preMoodData || !postMoodData) return null;

  const preColor = FEELING_COLORS[preMoodData.id] || '#B0AAA2';
  const postColor = FEELING_COLORS[postMoodData.id] || '#B0AAA2';
  const isSameMood = preMoodData.id === postMoodData.id;

  return (
    <Animated.View
      entering={FadeInDown.delay(1000).duration(500)}
      style={styles.moodShiftContainer}
    >
      <View style={styles.moodRow}>
        <View style={[styles.moodShiftCircle, { borderColor: preColor }]}>
          <Text style={styles.moodShiftEmoji}>{preMoodData.emoji || getMoodEmoji(preMoodData.id)}</Text>
        </View>
        <Ionicons name="arrow-forward" size={16} color="#D4CFC9" />
        <View style={[styles.moodShiftCircle, { borderColor: postColor }]}>
          <Text style={styles.moodShiftEmoji}>{postMoodData.emoji}</Text>
        </View>
      </View>
      <Text style={styles.moodNarrative}>
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

  // Inline mood state
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

  // Record post-mood when selected
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
    <View style={styles.container}>
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
          <View style={styles.sparkleCircle}>
            <Ionicons name="sparkles" size={32} color="#C17666" />
          </View>
          <Text style={styles.heroText}>
            {completedPrompts} truth{completedPrompts !== 1 ? 's' : ''} spoken.{'\n'}You showed up.
          </Text>
        </Animated.View>

        {/* Inline mood selector */}
        <Animated.View
          entering={FadeInDown.delay(800).duration(500)}
          style={styles.moodSection}
        >
          <Text style={styles.moodQuestion}>How do you feel now?</Text>
          <View style={styles.moodEmojiRow}>
            {MOODS.map((mood) => {
              const isSelected = selectedPostMood === mood.id;
              return (
                <Pressable
                  key={mood.id}
                  onPress={() => handlePostMoodSelect(mood.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${mood.label} mood`}
                  accessibilityState={{ selected: isSelected }}
                  style={[
                    styles.moodEmojiCircle,
                    isSelected && styles.moodEmojiCircleSelected,
                  ]}
                >
                  <Text style={styles.moodEmojiText}>{mood.emoji}</Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Mood shift visualization (appears when mood selected) */}
        {postMoodData && (
          <MoodShiftSection preMood={preMood || feeling} postMood={postMoodData} />
        )}

        {/* Optional reflection expander */}
        <Animated.View entering={FadeIn.delay(1200).duration(400)}>
          {!showReflection ? (
            <Pressable
              onPress={() => setShowReflection(true)}
              style={styles.reflectionTrigger}
            >
              <Text style={styles.reflectionTriggerText}>Add a reflection...</Text>
            </Pressable>
          ) : (
            <View style={styles.reflectionInputWrapper}>
              <TextInput
                style={styles.reflectionInput}
                placeholder="What came up for you?"
                placeholderTextColor="#B0AAA2"
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

          {/* Day-to-day continuity */}
          {stats.totalSessions > 1 && (
            <Text style={styles.continuityText}>
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

  // --- Hero section ---
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  sparkleCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8D0C6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroText: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 28,
    fontStyle: 'italic',
    color: '#2D2A26',
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
    color: '#7A756E',
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.card,
  },
  moodEmojiCircleSelected: {
    borderColor: '#C17666',
  },
  moodEmojiText: {
    fontSize: 22,
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
    backgroundColor: '#FFFFFF',
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
    color: '#7A756E',
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
    color: '#C17666',
  },
  reflectionInputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    ...shadows.card,
  },
  reflectionInput: {
    minHeight: 80,
    padding: 16,
    fontSize: 15,
    color: '#2D2A26',
    lineHeight: 22,
    textAlignVertical: 'top',
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
  continuityText: {
    fontSize: 14,
    color: '#B0AAA2',
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
    color: '#C17666',
  },
});
