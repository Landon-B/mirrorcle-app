import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/common';
import { useApp } from '../context/AppContext';
import { FEELINGS, getFeelingLabel } from '../constants';
import { affirmationService } from '../services/affirmations';
import { sessionService } from '../services/session';
import { getStartOfWeek, getStartOfMonth } from '../utils/dateUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TIME_PERIODS = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'all', label: 'All Time' },
];

export const TrendsScreen = ({ navigation }) => {
  const { stats, sessions, user } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [feelings, setFeelings] = useState(FEELINGS);
  const [activityData, setActivityData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      // Load feelings from Supabase
      const supabaseFeelings = await affirmationService.getFeelings();
      if (supabaseFeelings && supabaseFeelings.length > 0) {
        setFeelings(supabaseFeelings);
      }

      // Load activity data for the calendar
      if (user) {
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        const sessionsData = await sessionService.getSessionsInRange(fourWeeksAgo, new Date());

        // Create a set of dates with activity
        const activityDates = new Set(
          sessionsData.map(s => new Date(s.createdAt).toISOString().split('T')[0])
        );

        // Generate 28 days of activity data
        const activity = [];
        for (let i = 27; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          activity.push({
            date: dateStr,
            hasActivity: activityDates.has(dateStr),
          });
        }
        setActivityData(activity);
      } else {
        // For unauthenticated users, use local sessions
        const activityDates = new Set(
          sessions.map(s => {
            const date = s.date || s.createdAt;
            return date ? new Date(date).toISOString().split('T')[0] : null;
          }).filter(Boolean)
        );

        const activity = [];
        for (let i = 27; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          activity.push({
            date: dateStr,
            hasActivity: activityDates.has(dateStr),
          });
        }
        setActivityData(activity);
      }
    } catch (error) {
      console.log('Error loading trends data:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSessions = useMemo(() => {
    if (selectedPeriod === 'all') return sessions;

    const startDate = selectedPeriod === 'week' ? getStartOfWeek() : getStartOfMonth();
    return sessions.filter(s => {
      const sessionDate = s.date || s.createdAt;
      return sessionDate && sessionDate >= startDate;
    });
  }, [sessions, selectedPeriod]);

  const feelingsDistribution = useMemo(() => {
    const counts = {};
    filteredSessions.forEach(session => {
      const feeling = session.feeling || session.feelingId;
      if (feeling) {
        counts[feeling] = (counts[feeling] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([feeling, count]) => ({
        feeling,
        count,
        percentage: filteredSessions.length > 0 ? (count / filteredSessions.length) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredSessions]);

  const getFeelingColor = (feelingId) => {
    const feeling = feelings.find(f => f.id === feelingId);
    return feeling?.colors || ['#C17666', '#E8A090'];
  };

  const getFeelingLabelFromData = (feelingId) => {
    const feeling = feelings.find(f => f.id === feelingId);
    return feeling?.label || getFeelingLabel(feelingId);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={20} color="#7A756E" />
            </Pressable>
            <Text style={styles.title}>Trends</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C17666" />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color="#7A756E" />
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
                    <Text style={styles.barLabel}>{getFeelingLabelFromData(item.feeling)}</Text>
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

          {/* Activity Calendar */}
          <Card style={styles.chartCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar" size={18} color="#22D3EE" />
              <Text style={styles.cardTitle}>Activity</Text>
            </View>

            <View style={styles.activityGrid}>
              {activityData.map((day, i) => (
                <View
                  key={i}
                  style={[
                    styles.activityCell,
                    day.hasActivity && styles.activityCellActive,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.activityHint}>Last 4 weeks</Text>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2EE' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0ECE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: '#2D2A26', fontSize: 20, fontWeight: '600' },
  placeholder: { width: 42 },
  content: { padding: 20, gap: 16 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F0ECE7',
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
    backgroundColor: '#C17666',
  },
  periodButtonText: { color: '#7A756E', fontWeight: '500' },
  periodButtonTextActive: { color: '#FFFFFF' },
  statsRow: { flexDirection: 'row', gap: 12 },
  summaryCard: { flex: 1, alignItems: 'center', padding: 16 },
  summaryValue: { color: '#2D2A26', fontSize: 24, fontWeight: '700' },
  summaryLabel: { color: '#7A756E', fontSize: 12, marginTop: 4 },
  chartCard: { gap: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { color: '#2D2A26', fontSize: 16, fontWeight: '600' },
  emptyText: { color: '#7A756E', textAlign: 'center', paddingVertical: 20 },
  barsContainer: { gap: 12 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  barLabel: { color: '#7A756E', fontSize: 14, width: 80 },
  barTrack: {
    flex: 1,
    height: 24,
    backgroundColor: '#F0ECE7',
    borderRadius: 12,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 12 },
  barValue: { color: '#2D2A26', fontSize: 14, fontWeight: '600', width: 30, textAlign: 'right' },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  activityCell: {
    width: (SCREEN_WIDTH - 80) / 7 - 4,
    aspectRatio: 1,
    borderRadius: 4,
    backgroundColor: '#F0ECE7',
  },
  activityCellActive: {
    backgroundColor: '#C17666',
  },
  activityHint: { color: '#7A756E', fontSize: 12, textAlign: 'center', marginTop: 8 },
});
