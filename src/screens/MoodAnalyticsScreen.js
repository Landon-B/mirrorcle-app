import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ScreenHeader, Card, PrimaryButton } from '../components/common';
import { MoodPatternChart } from '../components/personalization/MoodPatternChart';
import { sessionService } from '../services/session';
import { getMoodEmoji, getMoodLabel, FEELING_COLORS } from '../constants/feelings';
import { useColors } from '../hooks/useColors';
import { typography } from '../styles/typography';
import { shadows } from '../styles/spacing';
import { usePaywall } from '../hooks/usePaywall';

const TIME_RANGES = [
  { key: 'week', label: 'Week', days: 7 },
  { key: 'month', label: 'Month', days: 30 },
  { key: '3months', label: '3 Months', days: 90 },
];

export const MoodAnalyticsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, isPro } = useApp();
  const { openPaywall } = usePaywall();
  const c = useColors();
  const [activeRange, setActiveRange] = useState('month');
  const [moodData, setMoodData] = useState(null);
  const [sessions, setSessions] = useState([]);
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

      const [sessionsData, trendsData] = await Promise.all([
        sessionService.getSessionsInRange(start, end),
        sessionService.getMoodTrends(start, end),
      ]);

      setSessions(sessionsData || []);
      setMoodData(trendsData || []);
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
                          <Text style={styles.transitionEmoji}>{getMoodEmoji(t.from)}</Text>
                          <Ionicons name="arrow-forward" size={14} color={c.textMuted} />
                          <Text style={styles.transitionEmoji}>{getMoodEmoji(t.to)}</Text>
                        </View>
                        <Text style={[styles.transitionLabel, { color: c.textSecondary }]}>
                          {getMoodLabel(t.from)} \u2192 {getMoodLabel(t.to)}
                        </Text>
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
  transitionEmoji: {
    fontSize: 20,
  },
  transitionLabel: {
    fontSize: 12,
    marginBottom: 2,
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
