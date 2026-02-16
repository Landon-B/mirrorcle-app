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
import { typography } from '../styles/typography';
import { shadows } from '../styles/spacing';

const COLORS = {
  bg: '#F5F2EE',
  rust: '#C17666',
  peach: '#E8D0C6',
  white: '#FFFFFF',
  textPrimary: '#2D2A26',
  textSecondary: '#7A756E',
  textMuted: '#B0AAA2',
  border: '#F0ECE7',
};

const TIME_RANGES = [
  { key: 'week', label: 'Week', days: 7 },
  { key: 'month', label: 'Month', days: 30 },
  { key: '3months', label: '3 Months', days: 90 },
];

export const MoodAnalyticsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, isPro } = useApp();
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
        const key = `${s.feelingId}→${s.postMoodId}`;
        transitions[key] = (transitions[key] || 0) + 1;
      }
    }
    return Object.entries(transitions)
      .map(([key, count]) => {
        const [from, to] = key.split('→');
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader label="MOOD JOURNEY" onBack={() => navigation.goBack()} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.rust} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Time range selector */}
          <View style={styles.tabRow}>
            {TIME_RANGES.map(range => (
              <Pressable
                key={range.key}
                style={[styles.tab, activeRange === range.key && styles.tabActive]}
                onPress={() => setActiveRange(range.key)}
              >
                <Text style={[styles.tabText, activeRange === range.key && styles.tabTextActive]}>
                  {range.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {sessions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="pulse-outline" size={40} color={COLORS.peach} />
              <Text style={styles.emptyTitle}>No mood data yet</Text>
              <Text style={styles.emptySubtitle}>
                Complete a few sessions to see your mood patterns.
              </Text>
            </View>
          ) : (
            <>
              {/* Mood Distribution */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>How You've Been Feeling</Text>
                <Card style={styles.chartCard}>
                  <MoodPatternChart data={moodDistribution} />
                </Card>
              </View>

              {/* Mood Transitions */}
              {moodTransitions.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Your Shifts</Text>
                  <View style={styles.transitionsContainer}>
                    {moodTransitions.map((t, index) => (
                      <Card key={index} style={styles.transitionCard}>
                        <View style={styles.transitionEmojis}>
                          <Text style={styles.transitionEmoji}>{getMoodEmoji(t.from)}</Text>
                          <Ionicons name="arrow-forward" size={14} color={COLORS.textMuted} />
                          <Text style={styles.transitionEmoji}>{getMoodEmoji(t.to)}</Text>
                        </View>
                        <Text style={styles.transitionLabel}>
                          {getMoodLabel(t.from)} → {getMoodLabel(t.to)}
                        </Text>
                        <Text style={styles.transitionCount}>
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
                  <View style={styles.premiumOverlay}>
                    <Ionicons name="lock-closed" size={24} color={COLORS.rust} />
                    <Text style={styles.premiumTitle}>Unlock Full Mood Journey</Text>
                    <Text style={styles.premiumSubtitle}>
                      See your mood patterns over months and discover deeper insights.
                    </Text>
                    <PrimaryButton
                      title="Deepen Your Practice"
                      onPress={() => navigation.navigate('Paywall')}
                      style={styles.premiumButton}
                    />
                  </View>
                </View>
              )}

              {/* Insight */}
              {insight && (isPro || activeRange === 'week') && (
                <Card style={styles.insightCard}>
                  <View style={styles.insightRow}>
                    <Ionicons name="bulb" size={18} color={COLORS.rust} />
                    <Text style={styles.insightText}>{insight}</Text>
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
    backgroundColor: COLORS.bg,
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
    backgroundColor: COLORS.border,
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
  tabActive: {
    backgroundColor: COLORS.rust,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
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
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  transitionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.rust,
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
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  // Premium gate
  premiumGate: {
    marginBottom: 20,
  },
  premiumOverlay: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 28,
    ...shadows.card,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
