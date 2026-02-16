import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { usePersonalization } from '../hooks/usePersonalization';
import { Card } from '../components/common';
import { MilestoneProgressCard } from '../components/personalization/MilestoneProgressCard';
import { personalizationService } from '../services/personalization';
import { quotesService } from '../services/quotes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  background: '#F5F2EE',
  cardBg: '#FFFFFF',
  textPrimary: '#2D2A26',
  textSecondary: '#7A756E',
  textMuted: '#B0AAA2',
  rust: '#C17666',
  peach: '#E8D0C6',
  heatmapHigh: '#C17666',
  heatmapMed: '#E8A090',
  heatmapLow: '#E8D0C6',
  heatmapNone: '#F0ECE7',
};

const TIME_RANGES = ['Week', 'Month', 'Year'];
const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// --- Real heatmap from sessions ---
const buildHeatmapFromSessions = (sessions) => {
  // Build a map of date string → session count
  const dateCounts = {};
  for (const s of sessions || []) {
    const d = new Date(s.createdAt || s.created_at || s.date);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    dateCounts[key] = (dateCounts[key] || 0) + 1;
  }

  // Build 4 weeks × 7 days grid (most recent 28 days)
  const grid = [];
  const today = new Date();
  for (let week = 0; week < 4; week++) {
    const row = [];
    for (let day = 0; day < 7; day++) {
      const daysAgo = (3 - week) * 7 + (6 - day);
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const count = dateCounts[key] || 0;
      let level = 0;
      if (count >= 3) level = 3;
      else if (count === 2) level = 2;
      else if (count === 1) level = 1;
      row.push(level);
    }
    grid.push(row);
  }
  return grid;
};

const heatmapColor = (level) => {
  switch (level) {
    case 3: return COLORS.heatmapHigh;
    case 2: return COLORS.heatmapMed;
    case 1: return COLORS.heatmapLow;
    default: return COLORS.heatmapNone;
  }
};

// --- Real sessions chart ---
const getDateRange = (range) => {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  let start;
  if (range === 'Week') {
    start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  } else if (range === 'Month') {
    start = new Date(end);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
  } else {
    start = new Date(end);
    start.setFullYear(start.getFullYear() - 1);
    start.setHours(0, 0, 0, 0);
  }
  return { start, end };
};

const buildChartData = (sessions, range) => {
  if (!sessions?.length) return { labels: [], values: [], maxVal: 0 };

  const { start, end } = getDateRange(range);
  const filtered = sessions.filter(s => {
    const d = new Date(s.createdAt || s.created_at || s.date);
    return d >= start && d <= end;
  });

  if (range === 'Week') {
    // 7 bars, one per day
    const labels = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const values = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      labels.push(dayNames[d.getDay()]);
      const count = filtered.filter(s => {
        const sd = new Date(s.createdAt || s.created_at || s.date);
        const sk = `${sd.getFullYear()}-${String(sd.getMonth() + 1).padStart(2, '0')}-${String(sd.getDate()).padStart(2, '0')}`;
        return sk === key;
      }).length;
      values.push(count);
    }
    return { labels, values, maxVal: Math.max(...values, 1) };
  }

  if (range === 'Month') {
    // 4 bars (weeks)
    const labels = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'];
    const values = [0, 0, 0, 0];
    for (const s of filtered) {
      const d = new Date(s.createdAt || s.created_at || s.date);
      const dayDiff = Math.floor((end - d) / 86400000);
      const weekIdx = Math.min(3, Math.floor(dayDiff / 7));
      values[3 - weekIdx] += 1;
    }
    return { labels, values, maxVal: Math.max(...values, 1) };
  }

  // Year: 12 bars (months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const labels = [];
  const values = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(monthNames[m.getMonth()]);
    const count = filtered.filter(s => {
      const d = new Date(s.createdAt || s.created_at || s.date);
      return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
    }).length;
    values.push(count);
  }
  return { labels, values, maxVal: Math.max(...values, 1) };
};

const computeTrendBadge = (sessions, range) => {
  if (!sessions?.length) return null;
  const { start: currentStart, end: currentEnd } = getDateRange(range);
  const duration = currentEnd - currentStart;
  const prevStart = new Date(currentStart.getTime() - duration);
  const prevEnd = new Date(currentStart.getTime() - 1);

  const currentCount = sessions.filter(s => {
    const d = new Date(s.createdAt || s.created_at || s.date);
    return d >= currentStart && d <= currentEnd;
  }).length;

  const prevCount = sessions.filter(s => {
    const d = new Date(s.createdAt || s.created_at || s.date);
    return d >= prevStart && d <= prevEnd;
  }).length;

  if (prevCount === 0 && currentCount === 0) return null;
  if (prevCount === 0) return { text: 'New!', positive: true };

  const pct = Math.round(((currentCount - prevCount) / prevCount) * 100);
  if (pct === 0) return { text: 'Steady', positive: true };
  return {
    text: `${pct > 0 ? '+' : ''}${pct}% vs last ${range.toLowerCase()}`,
    positive: pct >= 0,
  };
};

const formatTotalTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const formatAvgPerDay = (totalSeconds, totalSessions) => {
  if (totalSessions === 0) return '0m';
  const avgMinutes = Math.round((totalSeconds / totalSessions) / 60);
  return `Avg ${avgMinutes || 1}m/session`;
};

// --- Sessions bar chart ---
const SessionsChart = ({ labels, values, maxVal }) => {
  const chartHeight = 120;

  if (values.every(v => v === 0)) {
    return (
      <View style={chartStyles.emptyChart}>
        <Ionicons name="bar-chart-outline" size={28} color={COLORS.heatmapLow} />
        <Text style={chartStyles.emptyText}>Sessions will appear here</Text>
      </View>
    );
  }

  return (
    <View style={chartStyles.container}>
      <View style={chartStyles.chartArea}>
        {values.map((val, index) => {
          const height = maxVal > 0 ? (val / maxVal) * (chartHeight - 20) + (val > 0 ? 20 : 4) : 4;
          return (
            <View key={index} style={chartStyles.barColumn}>
              <View
                style={[
                  chartStyles.bar,
                  {
                    height,
                    backgroundColor: val > 0 ? COLORS.rust : COLORS.heatmapNone,
                    opacity: val > 0 ? 0.3 + (val / maxVal) * 0.7 : 1,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
      <View style={chartStyles.xAxis}>
        {labels.map((label, i) => (
          <Text key={i} style={chartStyles.xLabel}>{label}</Text>
        ))}
      </View>
    </View>
  );
};

const chartStyles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 4,
    gap: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '70%',
    borderRadius: 10,
    minWidth: 12,
    maxWidth: 28,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  xLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  emptyChart: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});

export const GrowthDashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { stats, sessions, user, isPro } = useApp();
  const { growthNudge } = usePersonalization();
  const [activeRange, setActiveRange] = useState('Week');
  const [nextMilestones, setNextMilestones] = useState([]);
  const [quote, setQuote] = useState(null);

  // Load milestones
  useEffect(() => {
    if (user?.id) {
      personalizationService.getNextMilestones(user.id)
        .then(setNextMilestones)
        .catch(() => {});
    }
  }, [user?.id, stats.totalSessions]);

  // Load dynamic quote
  useEffect(() => {
    quotesService.getRandom({ screen: 'growth', isPro: isPro || false })
      .then(q => { if (q) setQuote(q); })
      .catch(() => {});
  }, []);

  const totalAffirmations = stats.totalAffirmations || stats.totalSessions * 5;

  // Real heatmap from session data
  const heatmapData = useMemo(
    () => buildHeatmapFromSessions(sessions),
    [sessions]
  );

  // Real chart data based on active range
  const chartData = useMemo(
    () => buildChartData(sessions, activeRange),
    [sessions, activeRange]
  );

  // Real trend badge
  const trendBadge = useMemo(
    () => computeTrendBadge(sessions, activeRange),
    [sessions, activeRange]
  );

  const insightText = growthNudge?.message
    || (stats.totalSessions > 0
      ? 'Keep showing up for yourself. Every session builds your practice.'
      : 'Complete your first session to start tracking your growth.');

  const quoteText = quote
    ? `"${quote.text}"`
    : '"The only person you are destined to become is the person you decide to be."';
  const quoteAuthor = quote
    ? `— ${quote.author}`
    : '— Ralph Waldo Emerson';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>Growth</Text>
          <View style={styles.headerRight}>
            <Pressable
              style={styles.headerIcon}
              onPress={() => navigation?.navigate?.('NotificationSettings')}
              hitSlop={8}
            >
              <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
            </Pressable>
            <View style={styles.avatar}>
              <Ionicons name="person" size={16} color={COLORS.textSecondary} />
            </View>
          </View>
        </View>

        {/* Time Range Tabs */}
        <View style={styles.tabRow}>
          {TIME_RANGES.map((range) => (
            <Pressable
              key={range}
              style={[
                styles.tab,
                activeRange === range && styles.tabActive,
              ]}
              onPress={() => setActiveRange(range)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeRange === range && styles.tabTextActive,
                ]}
              >
                {range}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Sessions Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sessions</Text>
            {trendBadge && (
              <View style={styles.badge}>
                <Ionicons
                  name={trendBadge.positive ? 'trending-up' : 'trending-down'}
                  size={12}
                  color={trendBadge.positive ? COLORS.rust : COLORS.textSecondary}
                />
                <Text style={[styles.badgeText, !trendBadge.positive && { color: COLORS.textSecondary }]}>
                  {trendBadge.text}
                </Text>
              </View>
            )}
          </View>
          <Card style={styles.chartCard}>
            <SessionsChart
              labels={chartData.labels}
              values={chartData.values}
              maxVal={chartData.maxVal}
            />
          </Card>
        </View>

        {/* Stat Cards Row */}
        <View style={styles.statRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>AFFIRMATIONS</Text>
            <Text style={styles.statValue}>{totalAffirmations}</Text>
            <Text style={styles.statSubtext}>
              {stats.totalSessions} session{stats.totalSessions !== 1 ? 's' : ''}
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>REFLECTION TIME</Text>
            <Text style={styles.statValue}>{formatTotalTime(stats.totalTimeSeconds)}</Text>
            <Text style={styles.statSubtext}>
              {formatAvgPerDay(stats.totalTimeSeconds, stats.totalSessions)}
            </Text>
          </Card>
        </View>

        {/* Next Milestones */}
        {nextMilestones.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Next Milestones</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.milestonesScroll}
            >
              {nextMilestones.map((m, i) => (
                <MilestoneProgressCard
                  key={m.key}
                  title={m.title}
                  current={m.current}
                  target={m.target}
                  index={i}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Your Rhythm (Heatmap) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Rhythm</Text>
            <View style={styles.badge}>
              <Ionicons name="flame" size={12} color={COLORS.rust} />
              <Text style={styles.badgeText}>
                {stats.currentStreak} Day Flow
              </Text>
            </View>
          </View>
          <Card style={styles.heatmapCard}>
            {/* Weekday labels */}
            <View style={styles.heatmapHeader}>
              {WEEKDAY_LABELS.map((label, i) => (
                <Text key={i} style={styles.heatmapDayLabel}>{label}</Text>
              ))}
            </View>
            {/* Heatmap grid */}
            {heatmapData.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.heatmapRow}>
                {week.map((level, dayIndex) => (
                  <View
                    key={dayIndex}
                    style={[
                      styles.heatmapCircle,
                      { backgroundColor: heatmapColor(level) },
                    ]}
                  />
                ))}
              </View>
            ))}
          </Card>
        </View>

        {/* Journey & Reflection Links */}
        <View style={styles.journeyLinksRow}>
          <Pressable
            style={styles.journeyLink}
            onPress={() => navigation.navigate('JourneyTimeline')}
          >
            <Ionicons name="map-outline" size={20} color={COLORS.rust} />
            <Text style={styles.journeyLinkText}>Your Journey</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
          </Pressable>
          <Pressable
            style={styles.journeyLink}
            onPress={() => navigation.navigate('MoodAnalytics')}
          >
            <Ionicons name="pulse-outline" size={20} color={COLORS.rust} />
            <Text style={styles.journeyLinkText}>Mood Journey</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
          </Pressable>
          <Pressable
            style={styles.journeyLink}
            onPress={() => navigation.navigate('ReflectionSummary')}
          >
            <Ionicons name="analytics-outline" size={20} color={COLORS.rust} />
            <Text style={styles.journeyLinkText}>Monthly Reflection</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
          </Pressable>
        </View>

        {/* Evolution Insight */}
        <Card style={styles.insightCard}>
          <View style={styles.insightRow}>
            <View style={styles.insightIconContainer}>
              <Ionicons name="bulb" size={20} color={COLORS.rust} />
            </View>
            <View style={styles.insightTextContainer}>
              <Text style={styles.insightTitle}>Evolution Insight</Text>
              <Text style={styles.insightBody}>{insightText}</Text>
            </View>
          </View>
        </Card>

        {/* Motivational Quote */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>{quoteText}</Text>
          <Text style={styles.quoteAuthor}>{quoteAuthor}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const CARD_GAP = 12;
const STAT_CARD_WIDTH = (SCREEN_WIDTH - 48 - CARD_GAP) / 2;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.heatmapNone,
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
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  // Sections
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF5F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.rust,
  },

  // Chart
  chartCard: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },

  // Stat cards
  statRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
    marginBottom: 20,
  },
  statCard: {
    width: STAT_CARD_WIDTH,
    paddingVertical: 18,
    paddingHorizontal: 14,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.rust,
  },

  // Milestones
  milestonesScroll: {
    gap: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },

  // Heatmap
  heatmapCard: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  heatmapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  heatmapDayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    width: 28,
    textAlign: 'center',
  },
  heatmapRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  heatmapCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },

  // Journey links
  journeyLinksRow: {
    gap: 10,
    marginBottom: 20,
  },
  journeyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  journeyLinkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Insight
  insightCard: {
    marginBottom: 24,
    padding: 18,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDF5F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTextContainer: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  insightBody: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },

  // Quote
  quoteContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  quoteText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'serif',
  },
  quoteAuthor: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
    fontFamily: 'serif',
  },
});
