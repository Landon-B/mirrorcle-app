import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
  Share,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { PrimaryButton, Card, FloatingParticles } from '../components/common';
import { useTrial } from '../hooks/useTrial';
import { useEmotionalContext } from '../hooks/useEmotionalContext';
import { useFavorites } from '../hooks/useFavorites';
import { useHaptics } from '../hooks/useHaptics';
import { usePaywall } from '../hooks/usePaywall';
import { MOODS } from '../constants/feelings';
import { FOCUS_AREAS } from '../constants/focusAreas';
import { formatRelativeDate } from '../utils/dateUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RUST = '#C17666';
const RUST_LIGHT = '#E8A090';
const CREAM = '#F5F2EE';
const WARM_TINT = '#FDF5F2';
const BORDER_COLOR = '#E8E4DF';
const TEXT_PRIMARY = '#2C2520';
const TEXT_SECONDARY = '#7A7267';
const TEXT_MUTED = '#B0AAA2';

const SERIF_ITALIC = Platform.OS === 'ios' ? 'Georgia-Italic' : 'serif';

// Warm gradient pairs for colored cards
const INTENTION_GRADIENT = ['#C17666', '#D4956E'];
const RHYTHM_GRADIENT_TOP = ['#FBF3EF', '#FFFFFF'];

// --- Helpers ---

function getWeeklyActivity(sessions) {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon, ...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const activity = Array(7).fill(false);

  sessions.forEach((session) => {
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);
    const diff = Math.floor((sessionDate - monday) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff < 7) {
      activity[diff] = true;
    }
  });

  return activity;
}

// --- New User Dashboard ---

const NewUserDashboard = ({ navigation, emotionalContext, selectedMood, onMoodSelect }) => {
  const displayFocusAreas = FOCUS_AREAS.slice(0, 4);
  const { greetingName, greeting, ctaText } = emotionalContext;

  return (
    <>
      {/* Greeting */}
      <Animated.View entering={FadeInUp.duration(500)} style={styles.greetingSection}>
        <Text style={styles.greetingText}>
          {greetingName ? (
            <Text style={styles.rustText}>{greetingName}.</Text>
          ) : (
            <Text style={styles.rustText}>Welcome.</Text>
          )}
        </Text>
        <Text style={styles.emotionalSubtitle}>{greeting}</Text>
      </Animated.View>

      {/* Mood Pills */}
      <Animated.View entering={FadeInUp.delay(200).duration(500)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moodPillsContainer}
          style={styles.moodPillsScroll}
        >
          {MOODS.map((mood) => {
            const isSelected = selectedMood === mood.id;
            return (
              <Pressable
                key={mood.id}
                onPress={() => onMoodSelect(mood.id)}
                style={[
                  styles.moodPill,
                  isSelected && styles.moodPillSelected,
                ]}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    isSelected && styles.moodLabelSelected,
                  ]}
                >
                  {mood.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* Daily Focus Areas */}
      <Animated.View entering={FadeInUp.delay(400).duration(500)}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Focus Areas</Text>
          <Pressable onPress={() => navigation.navigate('AffirmTab')}>
            <Text style={styles.viewAllLink}>View All</Text>
          </Pressable>
        </View>

        <View style={styles.focusGrid}>
          {displayFocusAreas.map((area) => (
            <Card key={area.id} style={styles.focusCard}>
              <Text style={styles.focusEmoji}>{area.emoji}</Text>
              <Text style={styles.focusLabel}>{area.label}</Text>
              <Text style={styles.focusSubtitle}>Explore</Text>
            </Card>
          ))}
        </View>
      </Animated.View>

      {/* Start Session CTA */}
      <Animated.View entering={FadeInUp.delay(600).duration(500)} style={styles.ctaSection}>
        <PrimaryButton
          title={ctaText}
          icon="play"
          onPress={() => navigation.navigate('AffirmTab', { screen: 'FocusSelection' })}
          style={styles.ctaButton}
        />
      </Animated.View>
    </>
  );
};

// --- Returning User Dashboard ---

const StreakProgressBar = ({ weeklyActivity }) => {
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <View style={styles.streakBarContainer}>
      {weeklyActivity.map((active, index) => (
        <View key={index} style={styles.streakBarDayColumn}>
          <View
            style={[
              styles.streakBarSegment,
              active && styles.streakBarSegmentActive,
            ]}
          />
          <Text style={styles.streakBarDayLabel}>{dayLabels[index]}</Text>
        </View>
      ))}
    </View>
  );
};

const TrialDayCard = ({ dayContent, trialDay, daysRemaining, onPress }) => {
  if (!dayContent) return null;
  return (
    <Card style={styles.trialCard}>
      <View style={styles.trialHeader}>
        <View style={styles.trialIconCircle}>
          <Ionicons name={dayContent.icon} size={20} color={RUST} />
        </View>
        <View style={styles.trialBadge}>
          <Text style={styles.trialBadgeText}>
            Day {trialDay} · {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
          </Text>
        </View>
      </View>
      <Text style={styles.trialTitle}>{dayContent.title}</Text>
      <Text style={styles.trialMessage}>{dayContent.message}</Text>
      {dayContent.cta && (
        <Pressable style={styles.trialCta} onPress={onPress}>
          <Text style={styles.trialCtaText}>{dayContent.cta}</Text>
          <Ionicons name="arrow-forward" size={14} color={RUST} />
        </Pressable>
      )}
    </Card>
  );
};

const ReturningUserDashboard = ({ navigation, emotionalContext, stats, sessions }) => {
  const weeklyActivity = useMemo(() => getWeeklyActivity(sessions), [sessions]);
  const activeDays = weeklyActivity.filter(Boolean).length;
  const { trialStatus, dayContent } = useTrial();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { successPulse } = useHaptics();
  const { openPaywall } = usePaywall();

  const {
    greetingName,
    greeting,
    streakEncouragement,
    resonanceContent,
    dailyIntention,
    intentionContext,
    ctaText,
  } = emotionalContext;

  // Compassionate rhythm label
  const consistencyLabel = activeDays >= 5
    ? 'BEAUTIFUL RHYTHM THIS WEEK'
    : activeDays >= 3
      ? 'STEADY PRESENCE THIS WEEK'
      : activeDays >= 1
        ? 'YOUR RHYTHM IS BUILDING'
        : 'A NEW WEEK AWAITS';

  const isReturning = stats.currentStreak === 0 && stats.totalSessions > 0;

  // Dynamic stagger base — accounts for optional trial card
  const hasTrialCard = trialStatus.isInTrial && dayContent;
  const resonanceDelay = hasTrialCard ? 600 : 400;
  const intentionDelay = hasTrialCard ? 800 : 600;
  const ctaDelay = hasTrialCard ? 1000 : 800;

  return (
    <>
      {/* Brand Label */}
      <Text style={styles.brandLabel}>MIRRORCLE</Text>

      {/* Emotional Greeting */}
      <Animated.View entering={FadeInUp.duration(500)} style={styles.greetingSection}>
        <Text style={styles.greetingText}>
          {greetingName ? (
            <Text style={styles.rustText}>{greetingName}.</Text>
          ) : (
            <Text style={styles.rustText}>Welcome back.</Text>
          )}
        </Text>
        <Text style={styles.emotionalSubtitle}>{greeting}</Text>
      </Animated.View>

      {/* Rhythm Card — Narrative-First with warm gradient wash */}
      <Animated.View entering={FadeInUp.delay(200).duration(500)}>
        {isReturning ? (
          <View style={styles.momentumCardOuter}>
            <LinearGradient
              colors={RHYTHM_GRADIENT_TOP}
              style={styles.momentumGradient}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            >
              <Text style={styles.momentumTitle}>Your Rhythm</Text>
              <Text style={styles.rhythmNarrative}>
                Life happens. What matters is you came back.
              </Text>
              <StreakProgressBar weeklyActivity={weeklyActivity} />
              <Text style={styles.consistencyLabel}>READY WHEN YOU ARE</Text>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.momentumCardOuter}>
            <LinearGradient
              colors={RHYTHM_GRADIENT_TOP}
              style={styles.momentumGradient}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            >
              <Text style={styles.momentumTitle}>Your Rhythm</Text>
              <Text style={styles.rhythmNarrative}>{streakEncouragement}</Text>
              <View style={styles.streakRow}>
                <Text style={styles.streakNumber}>{stats.currentStreak}</Text>
                <Text style={styles.streakUnit}>day flow</Text>
              </View>
              <StreakProgressBar weeklyActivity={weeklyActivity} />
              <Text style={styles.consistencyLabel}>{consistencyLabel}</Text>
            </LinearGradient>
          </View>
        )}
      </Animated.View>

      {/* Trial Day Card */}
      {hasTrialCard && (
        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          <TrialDayCard
            dayContent={dayContent}
            trialDay={trialStatus.trialDay}
            daysRemaining={trialStatus.daysRemaining}
            onPress={() => {
              if (dayContent.feature) {
                openPaywall();
              } else {
                navigation.navigate('AffirmTab', { screen: 'FocusSelection' });
              }
            }}
          />
        </Animated.View>
      )}

      {/* What Resonated — warm tinted card with accent border */}
      {resonanceContent && (
        <Animated.View entering={FadeInUp.delay(resonanceDelay).duration(500)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>What Resonated</Text>
          </View>
          <View style={styles.resonanceCard}>
            <View style={styles.resonanceIconRow}>
              <View style={styles.resonanceIconCircle}>
                <Ionicons
                  name={resonanceContent.type === 'powerPhrase' ? 'mic' : 'heart'}
                  size={16}
                  color={RUST}
                />
              </View>
            </View>
            <Text style={styles.resonanceQuote}>"{resonanceContent.text}"</Text>
            <Text style={styles.resonanceContext}>
              {resonanceContent.type === 'powerPhrase'
                ? `You've spoken this ${resonanceContent.count} times`
                : `Saved ${formatRelativeDate(resonanceContent.favoritedAt)}`}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Personalized Daily Intention — warm gradient focal card */}
      <Animated.View entering={FadeInUp.delay(intentionDelay).duration(500)}>
        <LinearGradient
          colors={INTENTION_GRADIENT}
          style={styles.intentionCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.intentionTitle}>Daily Intention</Text>
          {intentionContext && (
            <Text style={styles.intentionContextLabel}>{intentionContext}</Text>
          )}
          <Text style={styles.intentionQuote}>
            "{dailyIntention?.text || ''}"
          </Text>
          <View style={styles.intentionActions}>
            <Pressable
              style={styles.intentionActionButton}
              onPress={async () => {
                if (!dailyIntention?.text) return;
                try {
                  await Share.share({
                    message: `"${dailyIntention.text}" - From my Mirrorcle practice`,
                  });
                } catch (error) {
                  // User cancelled or share failed
                }
              }}
            >
              <Ionicons name="share-outline" size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.intentionActionText}>SHARE</Text>
            </Pressable>
            <Pressable
              style={styles.intentionActionButton}
              onPress={async () => {
                if (!dailyIntention?.id) return;
                await toggleFavorite(dailyIntention.id);
                successPulse();
              }}
            >
              <Ionicons
                name={dailyIntention?.id && isFavorite(dailyIntention.id) ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color="rgba(255,255,255,0.8)"
              />
              <Text style={styles.intentionActionText}>
                {dailyIntention?.id && isFavorite(dailyIntention.id) ? 'SAVED' : 'SAVE'}
              </Text>
            </Pressable>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Begin CTA */}
      <Animated.View entering={FadeInUp.delay(ctaDelay).duration(500)} style={styles.ctaSection}>
        <PrimaryButton
          title={ctaText}
          icon="play"
          onPress={() => navigation.navigate('AffirmTab', { screen: 'FocusSelection' })}
          style={styles.ctaButton}
        />
      </Animated.View>
    </>
  );
};

// --- Main HomeScreen ---

export const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { stats, sessions } = useApp();
  const emotionalContext = useEmotionalContext();
  const [selectedMood, setSelectedMood] = useState(null);

  const isNewUser = stats.totalSessions < 3;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <FloatingParticles count={6} opacity={0.08} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isNewUser ? (
          <NewUserDashboard
            navigation={navigation}
            emotionalContext={emotionalContext}
            selectedMood={selectedMood}
            onMoodSelect={setSelectedMood}
          />
        ) : (
          <ReturningUserDashboard
            navigation={navigation}
            emotionalContext={emotionalContext}
            stats={stats}
            sessions={sessions}
          />
        )}
      </ScrollView>
    </View>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Brand label (returning user)
  brandLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 4,
  },

  // Greeting
  greetingSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    lineHeight: 36,
  },
  rustText: {
    color: RUST,
  },
  emotionalSubtitle: {
    fontFamily: SERIF_ITALIC,
    fontSize: 17,
    fontStyle: 'italic',
    color: TEXT_SECONDARY,
    lineHeight: 26,
    marginTop: 8,
  },

  // Mood Pills (new user)
  moodPillsScroll: {
    marginBottom: 28,
    marginHorizontal: -20,
  },
  moodPillsContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    backgroundColor: '#FFFFFF',
  },
  moodPillSelected: {
    backgroundColor: RUST,
    borderColor: RUST,
  },
  moodEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_PRIMARY,
  },
  moodLabelSelected: {
    color: '#FFFFFF',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: RUST,
  },

  // Focus Grid (new user)
  focusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  focusCard: {
    width: (SCREEN_WIDTH - 40 - 12) / 2,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  focusEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  focusLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  focusSubtitle: {
    fontSize: 12,
    color: TEXT_MUTED,
  },

  // CTA
  ctaSection: {
    marginBottom: 28,
  },
  ctaButton: {
    // inherits PrimaryButton styling
  },

  // Momentum Card — warm gradient wash (returning user)
  momentumCardOuter: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  momentumGradient: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  momentumTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  rhythmNarrative: {
    fontFamily: SERIF_ITALIC,
    fontSize: 17,
    fontStyle: 'italic',
    color: TEXT_PRIMARY,
    lineHeight: 26,
    marginBottom: 16,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: RUST,
  },
  streakUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    marginLeft: 6,
  },

  // Streak Progress Bar
  streakBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  streakBarDayColumn: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  streakBarSegment: {
    height: 8,
    borderRadius: 4,
    backgroundColor: BORDER_COLOR,
    width: '80%',
  },
  streakBarSegmentActive: {
    backgroundColor: RUST,
    shadowColor: RUST,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 2,
  },
  streakBarDayLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  consistencyLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: RUST,
    marginTop: 4,
  },

  // What Resonated — warm tinted card (returning user)
  resonanceCard: {
    backgroundColor: WARM_TINT,
    borderRadius: 20,
    borderLeftWidth: 4,
    borderLeftColor: RUST,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  resonanceIconRow: {
    marginBottom: 12,
  },
  resonanceIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(193, 118, 102, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resonanceQuote: {
    fontFamily: SERIF_ITALIC,
    fontSize: 18,
    fontStyle: 'italic',
    color: TEXT_PRIMARY,
    lineHeight: 28,
    marginBottom: 10,
  },
  resonanceContext: {
    fontSize: 12,
    fontWeight: '500',
    color: RUST,
    letterSpacing: 0.3,
  },

  // Daily Intention — warm gradient focal card (returning user)
  intentionCard: {
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 22,
    marginBottom: 20,
    shadowColor: RUST,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  intentionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  intentionContextLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  intentionQuote: {
    fontFamily: SERIF_ITALIC,
    fontSize: 20,
    fontStyle: 'italic',
    color: '#FFFFFF',
    lineHeight: 30,
    marginBottom: 18,
  },
  intentionActions: {
    flexDirection: 'row',
    gap: 20,
  },
  intentionActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  intentionActionText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: 'rgba(255, 255, 255, 0.85)',
  },

  // Trial Day Card
  trialCard: {
    marginBottom: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderLeftWidth: 3,
    borderLeftColor: RUST,
  },
  trialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  trialIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FDF5F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trialBadge: {
    backgroundColor: '#FDF5F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  trialBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: RUST,
  },
  trialTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  trialMessage: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 12,
  },
  trialCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trialCtaText: {
    fontSize: 13,
    fontWeight: '700',
    color: RUST,
  },
});
