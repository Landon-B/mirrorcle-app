import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ScreenHeader } from '../components/common';
import { useJourney } from '../hooks/useJourney';
import { typography } from '../styles/typography';
import { shadows } from '../styles/spacing';

const COLORS = {
  bg: '#F5F2EE',
  rust: '#C17666',
  peach: '#E8D0C6',
  line: '#E8A090',
  white: '#FFFFFF',
  textPrimary: '#2D2A26',
  textSecondary: '#7A756E',
  textMuted: '#B0AAA2',
};

const TIMELINE_LEFT = 36;

// --- Timeline Node ---
const TimelineNode = ({ filled }) => (
  <View
    style={[
      styles.node,
      filled ? styles.nodeFilled : styles.nodeOutline,
    ]}
  />
);

// --- Timeline Cards ---

const MilestoneCard = ({ event, index }) => (
  <Animated.View
    entering={FadeInUp.delay(100 + index * 80).duration(400)}
    style={styles.eventRow}
  >
    <View style={styles.nodeColumn}>
      <TimelineNode filled />
    </View>
    <View style={[styles.card, styles.milestoneCard]}>
      <View style={styles.milestoneHeader}>
        <View style={styles.milestoneIconCircle}>
          <Ionicons
            name={getMilestoneIcon(event.key)}
            size={16}
            color={COLORS.rust}
          />
        </View>
        <Text style={styles.milestoneLabel}>MILESTONE</Text>
      </View>
      <Text style={styles.milestoneNarrative}>{event.narrative}</Text>
      <Text style={styles.dateText}>{formatDate(event.date)}</Text>
    </View>
  </Animated.View>
);

const WeekSummaryCard = ({ event, index }) => (
  <Animated.View
    entering={FadeInUp.delay(100 + index * 80).duration(400)}
    style={styles.eventRow}
  >
    <View style={styles.nodeColumn}>
      <TimelineNode filled={false} />
    </View>
    <View style={styles.card}>
      <Text style={styles.weekLabel}>WEEK {event.weekNumber}</Text>
      <Text style={styles.weekNarrative}>{event.narrative}</Text>
      <View style={styles.weekStats}>
        <View style={styles.weekStat}>
          <Text style={styles.weekStatValue}>{event.stats.sessions}</Text>
          <Text style={styles.weekStatLabel}>sessions</Text>
        </View>
        <View style={styles.weekStat}>
          <Text style={styles.weekStatValue}>{event.stats.totalMinutes}</Text>
          <Text style={styles.weekStatLabel}>minutes</Text>
        </View>
        <View style={styles.weekStat}>
          <Text style={styles.weekStatValue}>{event.stats.affirmations}</Text>
          <Text style={styles.weekStatLabel}>truths</Text>
        </View>
      </View>
    </View>
  </Animated.View>
);

const StreakRecoveryCard = ({ event, index }) => (
  <Animated.View
    entering={FadeInUp.delay(100 + index * 80).duration(400)}
    style={styles.eventRow}
  >
    <View style={styles.nodeColumn}>
      <TimelineNode filled={false} />
    </View>
    <View style={[styles.card, styles.recoveryCard]}>
      <View style={styles.recoveryRow}>
        <Ionicons name="refresh" size={16} color={COLORS.rust} />
        <Text style={styles.recoveryText}>{event.narrative}</Text>
      </View>
      <Text style={styles.dateText}>{formatDate(event.date)}</Text>
    </View>
  </Animated.View>
);

// --- Helpers ---

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getMilestoneIcon(key) {
  const icons = {
    first_session: 'sparkles',
    ten_sessions: 'flame',
    fifty_sessions: 'trophy',
    hundred_affirmations: 'diamond',
    seven_day_streak: 'calendar',
    thirty_day_streak: 'medal',
    first_favorite: 'heart',
    all_feelings_explored: 'color-palette',
    custom_affirmation_created: 'create',
  };
  return icons[key] || 'star';
}

// --- Empty State ---
const EmptyState = () => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIcon}>
      <Ionicons name="sparkles" size={32} color={COLORS.rust} />
    </View>
    <Text style={styles.emptyTitle}>Your journey is just beginning</Text>
    <Text style={styles.emptySubtitle}>
      Come back after a few sessions to see your transformation unfold.
    </Text>
  </View>
);

// --- Main Screen ---

export const JourneyTimelineScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { timeline, loading } = useJourney();

  const renderEvent = (event, index) => {
    switch (event.type) {
      case 'milestone':
        return <MilestoneCard key={`m-${event.key}`} event={event} index={index} />;
      case 'week_summary':
        return <WeekSummaryCard key={`w-${event.weekNumber}`} event={event} index={index} />;
      case 'streak_recovery':
        return <StreakRecoveryCard key={`r-${event.date}`} event={event} index={index} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader label="YOUR JOURNEY" onBack={() => navigation.goBack()} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.rust} />
        </View>
      ) : timeline.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Timeline vertical line */}
          <View style={styles.timelineLine} />

          {timeline.map((event, index) => renderEvent(event, index))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Timeline line
  timelineLine: {
    position: 'absolute',
    left: 20 + TIMELINE_LEFT - 1,
    top: 16,
    bottom: 40,
    width: 2,
    backgroundColor: COLORS.line,
    opacity: 0.4,
  },

  // Event row layout
  eventRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  nodeColumn: {
    width: TIMELINE_LEFT,
    alignItems: 'center',
    paddingTop: 16,
  },

  // Node circles on the line
  node: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  nodeFilled: {
    backgroundColor: COLORS.rust,
  },
  nodeOutline: {
    backgroundColor: COLORS.bg,
    borderWidth: 2,
    borderColor: COLORS.line,
  },

  // Cards
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginLeft: 12,
    ...shadows.card,
  },

  // Milestone card
  milestoneCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.rust,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  milestoneIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.rust,
  },
  milestoneNarrative: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 15,
    fontStyle: 'italic',
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 8,
  },

  // Week summary card
  weekLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  weekNarrative: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 16,
    fontStyle: 'italic',
    color: COLORS.textPrimary,
    lineHeight: 24,
    marginBottom: 12,
  },
  weekStats: {
    flexDirection: 'row',
    gap: 20,
  },
  weekStat: {
    alignItems: 'center',
  },
  weekStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  weekStatLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Streak recovery card
  recoveryCard: {
    backgroundColor: '#FDF8F6',
  },
  recoveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  recoveryText: {
    flex: 1,
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Date text
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.peach,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
