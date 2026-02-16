import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { usePersonalization } from '../hooks/usePersonalization';
import { Card } from '../components/common';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  background: '#F5F2EE',
  cardBg: '#FFFFFF',
  textPrimary: '#2D2A26',
  textSecondary: '#7A756E',
  rust: '#C17666',
  peach: '#E8D0C6',
  heatmapHigh: '#C17666',
  heatmapMed: '#E8A090',
  heatmapLow: '#E8D0C6',
  heatmapNone: '#F0ECE7',
};

const TIME_RANGES = ['Week', 'Month', 'Year'];
const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Generate placeholder heatmap data (4 weeks x 7 days)
const generateHeatmapData = (sessions, currentStreak) => {
  const grid = [];
  for (let week = 0; week < 4; week++) {
    const row = [];
    for (let day = 0; day < 7; day++) {
      // Use a combination of streak and session count to create plausible activity
      const index = week * 7 + day;
      const daysAgo = 27 - index;
      let level = 0;

      if (daysAgo < currentStreak) {
        // Within current streak: active days
        level = 3;
      } else if (daysAgo < currentStreak + 5 && Math.random() > 0.4) {
        level = Math.floor(Math.random() * 3) + 1;
      } else if (Math.random() > 0.6) {
        level = Math.floor(Math.random() * 2) + 1;
      }

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

const formatTotalTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const formatAvgPerDay = (totalSeconds, totalSessions) => {
  if (totalSessions === 0) return '0m';
  const avgSecondsPerSession = totalSeconds / totalSessions;
  const avgMinutes = Math.round(avgSecondsPerSession / 60);
  return `Avg ${avgMinutes || 1}m/day`;
};

// Simple mock line chart rendered with Views
const MockLineChart = () => {
  const points = [40, 55, 45, 65, 60, 75, 70];
  const maxVal = Math.max(...points);
  const minVal = Math.min(...points);
  const range = maxVal - minVal || 1;
  const chartHeight = 120;

  return (
    <View style={mockChartStyles.container}>
      <View style={mockChartStyles.chartArea}>
        {points.map((point, index) => {
          const height = ((point - minVal) / range) * (chartHeight - 20) + 20;
          return (
            <View key={index} style={mockChartStyles.barColumn}>
              <View
                style={[
                  mockChartStyles.bar,
                  {
                    height,
                    backgroundColor: COLORS.rust,
                    opacity: 0.15 + (index / points.length) * 0.85,
                  },
                ]}
              />
              <View
                style={[
                  mockChartStyles.dot,
                  {
                    bottom: height - 4,
                  },
                ]}
              />
            </View>
          );
        })}
        {/* Connecting line overlay */}
        <View style={mockChartStyles.lineOverlay}>
          {points.map((point, index) => {
            if (index === points.length - 1) return null;
            const currentHeight = ((point - minVal) / range) * (chartHeight - 20) + 20;
            const nextHeight = ((points[index + 1] - minVal) / range) * (chartHeight - 20) + 20;
            const columnWidth = (SCREEN_WIDTH - 80) / points.length;
            const dx = columnWidth;
            const dy = nextHeight - currentHeight;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(-dy, dx) * (180 / Math.PI);

            return (
              <View
                key={`line-${index}`}
                style={{
                  position: 'absolute',
                  left: index * columnWidth + columnWidth / 2,
                  bottom: currentHeight - 1,
                  width: length,
                  height: 2,
                  backgroundColor: COLORS.rust,
                  borderRadius: 1,
                  transform: [{ rotate: `${-angle}deg` }],
                  transformOrigin: 'left bottom',
                }}
              />
            );
          })}
        </View>
      </View>
      <View style={mockChartStyles.xAxis}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <Text key={day} style={mockChartStyles.xLabel}>{day}</Text>
        ))}
      </View>
    </View>
  );
};

const mockChartStyles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 20,
    borderRadius: 10,
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.rust,
  },
  lineOverlay: {
    ...StyleSheet.absoluteFillObject,
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
  },
});

export const GrowthDashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { stats, sessions } = useApp();
  const { growthNudge } = usePersonalization();
  const [activeRange, setActiveRange] = useState('Week');

  const totalAffirmations = stats.totalAffirmations || stats.totalSessions * 5;

  const heatmapData = useMemo(
    () => generateHeatmapData(sessions, stats.currentStreak),
    [sessions.length, stats.currentStreak]
  );

  const insightText = growthNudge?.message
    || 'Your morning sessions show higher engagement. Consider making mornings your dedicated affirmation time.';

  const quoteText = '"The only person you are destined to become is the person you decide to be."';
  const quoteAuthor = '-- Ralph Waldo Emerson';

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

        {/* Mood Evolution */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mood Evolution</Text>
            <View style={styles.badge}>
              <Ionicons name="trending-up" size={12} color={COLORS.rust} />
              <Text style={styles.badgeText}>+12% vs last week</Text>
            </View>
          </View>
          <Card style={styles.chartCard}>
            <MockLineChart />
          </Card>
        </View>

        {/* Stat Cards Row */}
        <View style={styles.statRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>AFFIRMATIONS</Text>
            <Text style={styles.statValue}>{totalAffirmations}</Text>
            <Text style={styles.statSubtext}>Daily goal met</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>REFLECTION TIME</Text>
            <Text style={styles.statValue}>{formatTotalTime(stats.totalTimeSeconds)}</Text>
            <Text style={styles.statSubtext}>
              {formatAvgPerDay(stats.totalTimeSeconds, stats.totalSessions)}
            </Text>
          </Card>
        </View>

        {/* Consistency Journey */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Consistency Journey</Text>
            <View style={styles.badge}>
              <Ionicons name="flame" size={12} color={COLORS.rust} />
              <Text style={styles.badgeText}>
                {stats.currentStreak} Day Streak
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
