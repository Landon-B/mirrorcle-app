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
import { useColors } from '../hooks/useColors';
import { typography } from '../styles/typography';
import { shadows } from '../styles/spacing';

const TIMELINE_LEFT = 36;

// --- Timeline Node ---
const TimelineNode = ({ filled, c }) => (
  <View
    style={[
      styles.node,
      filled
        ? { backgroundColor: c.accentRust }
        : { backgroundColor: c.background, borderWidth: 2, borderColor: c.feelingPink },
    ]}
  />
);

// --- Timeline Cards ---

const MilestoneCard = ({ event, index, c }) => (
  <Animated.View
    entering={FadeInUp.delay(100 + index * 80).duration(400)}
    style={styles.eventRow}
  >
    <View style={styles.nodeColumn}>
      <TimelineNode filled c={c} />
    </View>
    <View style={[styles.card, { backgroundColor: c.surface }, styles.milestoneCard, { borderLeftColor: c.accentRust }]}>
      <View style={styles.milestoneHeader}>
        <View style={[styles.milestoneIconCircle, { backgroundColor: c.accentPeach }]}>
          <Ionicons
            name={getMilestoneIcon(event.key)}
            size={16}
            color={c.accentRust}
          />
        </View>
        <Text style={[styles.milestoneLabel, { color: c.accentRust }]}>MILESTONE</Text>
      </View>
      <Text style={[styles.milestoneNarrative, { color: c.textPrimary }]}>{event.narrative}</Text>
      <Text style={[styles.dateText, { color: c.textMuted }]}>{formatDate(event.date)}</Text>
    </View>
  </Animated.View>
);

const WeekSummaryCard = ({ event, index, c }) => (
  <Animated.View
    entering={FadeInUp.delay(100 + index * 80).duration(400)}
    style={styles.eventRow}
  >
    <View style={styles.nodeColumn}>
      <TimelineNode filled={false} c={c} />
    </View>
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <Text style={[styles.weekLabel, { color: c.textMuted }]}>WEEK {event.weekNumber}</Text>
      <Text style={[styles.weekNarrative, { color: c.textPrimary }]}>{event.narrative}</Text>
      <View style={styles.weekStats}>
        <View style={styles.weekStat}>
          <Text style={[styles.weekStatValue, { color: c.textPrimary }]}>{event.stats.sessions}</Text>
          <Text style={[styles.weekStatLabel, { color: c.textMuted }]}>sessions</Text>
        </View>
        <View style={styles.weekStat}>
          <Text style={[styles.weekStatValue, { color: c.textPrimary }]}>{event.stats.totalMinutes}</Text>
          <Text style={[styles.weekStatLabel, { color: c.textMuted }]}>minutes</Text>
        </View>
        <View style={styles.weekStat}>
          <Text style={[styles.weekStatValue, { color: c.textPrimary }]}>{event.stats.affirmations}</Text>
          <Text style={[styles.weekStatLabel, { color: c.textMuted }]}>truths</Text>
        </View>
      </View>
    </View>
  </Animated.View>
);

const StreakRecoveryCard = ({ event, index, c }) => (
  <Animated.View
    entering={FadeInUp.delay(100 + index * 80).duration(400)}
    style={styles.eventRow}
  >
    <View style={styles.nodeColumn}>
      <TimelineNode filled={false} c={c} />
    </View>
    <View style={[styles.card, { backgroundColor: c.surfaceSecondary }]}>
      <View style={styles.recoveryRow}>
        <Ionicons name="refresh" size={16} color={c.accentRust} />
        <Text style={[styles.recoveryText, { color: c.textSecondary }]}>{event.narrative}</Text>
      </View>
      <Text style={[styles.dateText, { color: c.textMuted }]}>{formatDate(event.date)}</Text>
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
const EmptyState = ({ c }) => (
  <View style={styles.emptyState}>
    <View style={[styles.emptyIcon, { backgroundColor: c.accentPeach }]}>
      <Ionicons name="sparkles" size={32} color={c.accentRust} />
    </View>
    <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>Your journey is just beginning</Text>
    <Text style={[styles.emptySubtitle, { color: c.textSecondary }]}>
      Come back after a few sessions to see your transformation unfold.
    </Text>
  </View>
);

// --- Main Screen ---

export const JourneyTimelineScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { timeline, loading } = useJourney();
  const c = useColors();

  const renderEvent = (event, index) => {
    switch (event.type) {
      case 'milestone':
        return <MilestoneCard key={`m-${event.key}`} event={event} index={index} c={c} />;
      case 'week_summary':
        return <WeekSummaryCard key={`w-${event.weekNumber}`} event={event} index={index} c={c} />;
      case 'streak_recovery':
        return <StreakRecoveryCard key={`r-${event.date}`} event={event} index={index} c={c} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <ScreenHeader label="YOUR JOURNEY" onBack={() => navigation.goBack()} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={c.accentRust} />
        </View>
      ) : timeline.length === 0 ? (
        <EmptyState c={c} />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Timeline vertical line */}
          <View style={[styles.timelineLine, { backgroundColor: c.feelingPink }]} />

          {timeline.map((event, index) => renderEvent(event, index))}
        </ScrollView>
      )}
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

  // Cards
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    marginLeft: 12,
    ...shadows.card,
  },

  // Milestone card
  milestoneCard: {
    borderLeftWidth: 3,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  milestoneNarrative: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 8,
  },

  // Week summary card
  weekLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  weekNarrative: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 16,
    fontStyle: 'italic',
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
  },
  weekStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // Streak recovery card
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
    lineHeight: 20,
  },

  // Date text
  dateText: {
    fontSize: 12,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
