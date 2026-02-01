import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, Card } from '../components/common';
import { useApp } from '../context/AppContext';
import { FEELINGS, getFeelingLabel } from '../constants';
import { getStartOfWeek, getStartOfMonth } from '../utils/dateUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TIME_PERIODS = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'all', label: 'All Time' },
];

export const TrendsScreen = ({ navigation }) => {
  const { stats, sessions } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const filteredSessions = useMemo(() => {
    if (selectedPeriod === 'all') return sessions;

    const startDate = selectedPeriod === 'week' ? getStartOfWeek() : getStartOfMonth();
    return sessions.filter(s => s.date >= startDate);
  }, [sessions, selectedPeriod]);

  const feelingsDistribution = useMemo(() => {
    const counts = {};
    filteredSessions.forEach(session => {
      if (session.feeling) {
        counts[session.feeling] = (counts[session.feeling] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([feeling, count]) => ({
        feeling,
        count,
        percentage: (count / filteredSessions.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredSessions]);

  const getFeelingColor = (feelingId) => {
    const feeling = FEELINGS.find(f => f.id === feelingId);
    return feeling?.colors || ['#A855F7', '#EC4899'];
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.title}>Trends</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Time Period Selector */}
          <View style={styles.periodSelector}>
            {TIME_PERIODS.map((period) => (
              <Pressable
                key={period.id}
                onPress={() => setSelectedPeriod(period.id)}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.id && styles.periodButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period.id && styles.periodButtonTextActive,
                  ]}
                >
                  {period.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Summary Stats */}
          <View style={styles.statsRow}>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{filteredSessions.length}</Text>
              <Text style={styles.summaryLabel}>Sessions</Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{stats.currentStreak}</Text>
              <Text style={styles.summaryLabel}>Day Streak</Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{stats.totalAffirmations}</Text>
              <Text style={styles.summaryLabel}>Affirmations</Text>
            </Card>
          </View>

          {/* Feelings Distribution */}
          <Card style={styles.chartCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="heart" size={18} color="#F472B6" />
              <Text style={styles.cardTitle}>Feelings Distribution</Text>
            </View>

            {feelingsDistribution.length === 0 ? (
              <Text style={styles.emptyText}>No data for this period</Text>
            ) : (
              <View style={styles.barsContainer}>
                {feelingsDistribution.map((item) => (
                  <View key={item.feeling} style={styles.barRow}>
                    <Text style={styles.barLabel}>{getFeelingLabel(item.feeling)}</Text>
                    <View style={styles.barTrack}>
                      <LinearGradient
                        colors={getFeelingColor(item.feeling)}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.barFill, { width: `${Math.max(item.percentage, 5)}%` }]}
                      />
                    </View>
                    <Text style={styles.barValue}>{item.count}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>

          {/* Activity Calendar Placeholder */}
          <Card style={styles.chartCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar" size={18} color="#22D3EE" />
              <Text style={styles.cardTitle}>Activity</Text>
            </View>

            <View style={styles.activityGrid}>
              {Array.from({ length: 28 }, (_, i) => {
                const hasActivity = Math.random() > 0.5;
                return (
                  <View
                    key={i}
                    style={[
                      styles.activityCell,
                      hasActivity && styles.activityCellActive,
                    ]}
                  />
                );
              })}
            </View>
            <Text style={styles.activityHint}>Last 4 weeks</Text>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '600' },
  placeholder: { width: 40 },
  content: { padding: 20, gap: 16 },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#A855F7',
  },
  periodButtonText: { color: '#94A3B8', fontWeight: '500' },
  periodButtonTextActive: { color: '#fff' },
  statsRow: { flexDirection: 'row', gap: 12 },
  summaryCard: { flex: 1, alignItems: 'center', padding: 16 },
  summaryValue: { color: '#fff', fontSize: 24, fontWeight: '700' },
  summaryLabel: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  chartCard: { gap: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptyText: { color: '#94A3B8', textAlign: 'center', paddingVertical: 20 },
  barsContainer: { gap: 12 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  barLabel: { color: '#CBD5F5', fontSize: 14, width: 80 },
  barTrack: {
    flex: 1,
    height: 24,
    backgroundColor: 'rgba(71, 85, 105, 0.3)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 12 },
  barValue: { color: '#fff', fontSize: 14, fontWeight: '600', width: 30, textAlign: 'right' },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  activityCell: {
    width: (SCREEN_WIDTH - 80) / 7 - 4,
    aspectRatio: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(71, 85, 105, 0.3)',
  },
  activityCellActive: {
    backgroundColor: '#A855F7',
  },
  activityHint: { color: '#94A3B8', fontSize: 12, textAlign: 'center', marginTop: 8 },
});
