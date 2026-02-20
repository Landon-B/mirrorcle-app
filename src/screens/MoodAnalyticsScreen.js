import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ScreenHeader, Card, PrimaryButton } from '../components/common';
import { MoodPatternChart } from '../components/personalization/MoodPatternChart';
import { sessionService } from '../services/session';
import { checkInService } from '../services/checkin';
import { getMoodLabel, getFeelingColor, QUADRANTS } from '../constants/feelings';
import { useColors } from '../hooks/useColors';
import { typography } from '../styles/typography';
import { shadows } from '../styles/spacing';
import { usePaywall } from '../hooks/usePaywall';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SERIF_ITALIC = Platform.OS === 'ios' ? 'Georgia-Italic' : 'serif';

const TIME_RANGES = [
  { key: 'week', label: 'Week', days: 7 },
  { key: 'month', label: 'Month', days: 30 },
  { key: '3months', label: '3 Months', days: 90 },
];

// --- Mood Trajectory Component ---
const MoodTrajectoryChart = ({ data, c }) => {
  if (!data || data.length < 2) return null;

  const barHeight = 24;
  const barGap = 6;
  const maxWidth = SCREEN_WIDTH - 100; // Account for labels + padding

  // Quadrant colors matching QUADRANTS constant
  const quadrantColors = {
    bright: QUADRANTS.find(q => q.id === 'bright')?.colorPrimary || '#D4956E',
    charged: QUADRANTS.find(q => q.id === 'charged')?.colorPrimary || '#C17666',
    tender: QUADRANTS.find(q => q.id === 'tender')?.colorPrimary || '#8DAA82',
    deep: QUADRANTS.find(q => q.id === 'deep')?.colorPrimary || '#8898B0',
  };

  return (
    <View style={trajectoryStyles.container}>
      {data.map((week, index) => {
        if (week.total === 0) return null;
        const weekLabel = index === data.length - 1
          ? 'Now'
          : `${data.length - 1 - index}w`;

        return (
          <View key={week.week} style={trajectoryStyles.row}>
            <Text style={[trajectoryStyles.weekLabel, { color: c.textMuted }]}>
              {weekLabel}
            </Text>
            <View style={[trajectoryStyles.barContainer, { height: barHeight }]}>
              {/* Stacked bar: bright + tender (positive) | charged + deep (negative) */}
              {week.brightPct > 0 && (
                <View style={[trajectoryStyles.segment, {
                  width: `${week.brightPct}%`,
                  backgroundColor: quadrantColors.bright,
                  borderTopLeftRadius: 4,
                  borderBottomLeftRadius: 4,
                }]} />
              )}
              {week.tenderPct > 0 && (
                <View style={[trajectoryStyles.segment, {
                  width: `${week.tenderPct}%`,
                  backgroundColor: quadrantColors.tender,
                }]} />
              )}
              {week.chargedPct > 0 && (
                <View style={[trajectoryStyles.segment, {
                  width: `${week.chargedPct}%`,
                  backgroundColor: quadrantColors.charged,
                }]} />
              )}
              {week.deepPct > 0 && (
                <View style={[trajectoryStyles.segment, {
                  width: `${week.deepPct}%`,
                  backgroundColor: quadrantColors.deep,
                  borderTopRightRadius: 4,
                  borderBottomRightRadius: 4,
                }]} />
              )}
            </View>
          </View>
        );
      })}

      {/* Legend */}
      <View style={trajectoryStyles.legend}>
        {[
          { id: 'bright', label: 'Bright' },
          { id: 'tender', label: 'Tender' },
          { id: 'charged', label: 'Charged' },
          { id: 'deep', label: 'Deep' },
        ].map(q => (
          <View key={q.id} style={trajectoryStyles.legendItem}>
            <View style={[trajectoryStyles.legendDot, { backgroundColor: quadrantColors[q.id] }]} />
            <Text style={[trajectoryStyles.legendText, { color: c.textMuted }]}>{q.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const trajectoryStyles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  weekLabel: {
    fontSize: 11,
    fontWeight: '500',
    width: 28,
    textAlign: 'right',
  },
  barContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  segment: {
    height: '100%',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '500',
  },
});

export const MoodAnalyticsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, isPro } = useApp();
  const { openPaywall } = usePaywall();
  const c = useColors();
  const [activeRange, setActiveRange] = useState('month');
  const [moodData, setMoodData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [trajectoryData, setTrajectoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    loadData();
  }, [user?.id, activeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const range = TIME_RANGES.find(r => r.key === activeRange);
      const start = new Date();
      start.setDate(start.getDate() - range.days);
      const end = new Date();

      const weeksForTrajectory = Math.ceil(range.days / 7);

      const [sessionsData, trendsData, trajData] = await Promise.all([
        sessionService.getSessionsInRange(start, end),
        sessionService.getMoodTrends(start, end),
        checkInService.computeQuadrantTrajectory(weeksForTrajectory),
      ]);

      setSessions(sessionsData || []);
      setMoodData(trendsData || []);
      setTrajectoryData(trajData || []);
    } catch (error) {
      console.error('Error loading mood data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Compute mood distribution
  const moodDistribution = useMemo(() => {
    if (!sessions || sessions.length === 0) return [];
    const counts = {};
    for (const s of sessions) {
      if (s.feelingId) {
        counts[s.feelingId] = (counts[s.feelingId] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([moodId, count]) => ({ moodId, count }))
      .sort((a, b) => b.count - a.count);
  }, [sessions]);

  // Compute mood transitions (pre -> post where both exist)
  const moodTransitions = useMemo(() => {
    if (!sessions || sessions.length === 0) return [];
    const transitions = {};
    for (const s of sessions) {
      if (s.feelingId && s.postMoodId && s.feelingId !== s.postMoodId) {
        const key = `${s.feelingId}\u2192${s.postMoodId}`;
        transitions[key] = (transitions[key] || 0) + 1;
      }
    }
    return Object.entries(transitions)
      .map(([key, count]) => {
        const [from, to] = key.split('\u2192');
        return { from, to, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [sessions]);

  // Generate insight text
  const insight = useMemo(() => {
    if (moodDistribution.length === 0) return null;
    const topMood = moodDistribution[0];
    const totalSessions = sessions.length;

    if (moodTransitions.length > 0) {
      const topTransition = moodTransitions[0];
      return `Your most common shift is from ${getMoodLabel(topTransition.from).toLowerCase()} to ${getMoodLabel(topTransition.to).toLowerCase()}. You're learning to find your center.`;
    }

    if (topMood.count / totalSessions > 0.6) {
      return `${getMoodLabel(topMood.moodId)} has been your dominant state. Notice if that feels like a pattern worth exploring.`;
    }

    return `You've experienced ${moodDistribution.length} different moods. That emotional range is a sign of self-awareness.`;
  }, [moodDistribution, moodTransitions, sessions]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <ScreenHeader label="MOOD JOURNEY" onBack={() => navigation.goBack()} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={c.accentRust} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Time range selector */}
          <View style={[styles.tabRow, { backgroundColor: c.surfaceTertiary }]}>
            {TIME_RANGES.map(range => (
              <Pressable
                key={range.key}
                style={[styles.tab, activeRange === range.key && { backgroundColor: c.accentRust }]}
                onPress={() => setActiveRange(range.key)}
              >
                <Text style={[styles.tabText, { color: c.textSecondary }, activeRange === range.key && { color: c.textOnPrimary }]}>
                  {range.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {sessions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="pulse-outline" size={40} color={c.accentPeach} />
              <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>No mood data yet</Text>
              <Text style={[styles.emptySubtitle, { color: c.textSecondary }]}>
                Complete a few sessions to see your mood patterns.
              </Text>
            </View>
          ) : (
            <>
              {/* Mood Trajectory — shows quadrant shift over time */}
              {trajectoryData.length >= 2 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Your Emotional Landscape</Text>
                  <Text style={[styles.trajectorySubtitle, { color: c.textSecondary }]}>
                    How your emotional landscape is shifting
                  </Text>
                  <Card style={styles.chartCard}>
                    <MoodTrajectoryChart data={trajectoryData} c={c} />
                  </Card>
                </View>
              )}

              {/* Mood Distribution */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>How You've Been Feeling</Text>
                <Card style={styles.chartCard}>
                  <MoodPatternChart data={moodDistribution} />
                </Card>
              </View>

              {/* Mood Transitions */}
              {moodTransitions.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Your Shifts</Text>
                  <View style={styles.transitionsContainer}>
                    {moodTransitions.map((t, index) => (
                      <Card key={index} style={styles.transitionCard}>
                        <View style={styles.transitionEmojis}>
                          <View style={[styles.transitionDot, { backgroundColor: getFeelingColor(t.from) }]} />
                          <Text style={[styles.transitionMoodLabel, { color: c.textPrimary }]}>{getMoodLabel(t.from)}</Text>
                          <Ionicons name="arrow-forward" size={14} color={c.textMuted} />
                          <View style={[styles.transitionDot, { backgroundColor: getFeelingColor(t.to) }]} />
                          <Text style={[styles.transitionMoodLabel, { color: c.textPrimary }]}>{getMoodLabel(t.to)}</Text>
                        </View>
                        <Text style={[styles.transitionCount, { color: c.accentRust }]}>
                          {t.count} time{t.count !== 1 ? 's' : ''}
                        </Text>
                      </Card>
                    ))}
                  </View>
                </View>
              )}

              {/* Premium gate for extended ranges */}
              {!isPro && activeRange !== 'week' && (
                <View style={styles.premiumGate}>
                  <View style={[styles.premiumOverlay, { backgroundColor: c.surface }]}>
                    <Ionicons name="lock-closed" size={24} color={c.accentRust} />
                    <Text style={[styles.premiumTitle, { color: c.textPrimary }]}>Unlock Full Mood Journey</Text>
                    <Text style={[styles.premiumSubtitle, { color: c.textSecondary }]}>
                      See your mood patterns over months and discover deeper insights.
                    </Text>
                    <PrimaryButton
                      title="Deepen Your Practice"
                      onPress={openPaywall}
                      style={styles.premiumButton}
                    />
                  </View>
                </View>
              )}

              {/* Insight */}
              {insight && (isPro || activeRange === 'week') && (
                <Card style={styles.insightCard}>
                  <View style={styles.insightRow}>
                    <Ionicons name="bulb" size={18} color={c.accentRust} />
                    <Text style={[styles.insightText, { color: c.textSecondary }]}>{insight}</Text>
                  </View>
                </Card>
              )}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  trajectorySubtitle: {
    fontFamily: SERIF_ITALIC,
    fontStyle: 'italic',
    fontSize: 14,
    lineHeight: 20,
    marginTop: -8,
    marginBottom: 12,
  },
  chartCard: {
    padding: 20,
  },

  // Transitions
  transitionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  transitionCard: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minWidth: 130,
  },
  transitionEmojis: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  transitionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  transitionMoodLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  transitionCount: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Insight
  insightCard: {
    padding: 16,
    marginBottom: 16,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  insightText: {
    flex: 1,
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
  },

  // Premium gate
  premiumGate: {
    marginBottom: 20,
  },
  premiumOverlay: {
    alignItems: 'center',
    borderRadius: 20,
    padding: 28,
    ...shadows.card,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  premiumSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  premiumButton: {
    width: '100%',
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
