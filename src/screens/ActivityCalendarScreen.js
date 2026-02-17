import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ScreenHeader, Card } from '../components/common';
import { useColors } from '../hooks/useColors';
import { typography } from '../styles/typography';
import { shadows } from '../styles/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL_SIZE = Math.floor((SCREEN_WIDTH - 40 - 36 - 7 * 4) / 7);
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const getActivityLevel = (dateStr, sessionDates) => {
  const count = sessionDates.filter(d => d === dateStr).length;
  if (count >= 3) return 3;
  if (count === 2) return 2;
  if (count === 1) return 1;
  return 0;
};

export const ActivityCalendarScreen = ({ navigation }) => {
  const { stats, sessions } = useApp();
  const c = useColors();

  const levelColor = (level) => {
    switch (level) {
      case 3: return c.accentRust;
      case 2: return c.feelingPink;
      case 1: return c.accentPeach;
      default: return c.surfaceTertiary;
    }
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Build session date strings from sessions array
  const sessionDates = useMemo(() => {
    if (!sessions?.length) return [];
    return sessions.map(s => {
      const d = new Date(s.created_at || s.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
  }, [sessions]);

  // Generate calendar grid for current month
  const calendarData = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = now.getDate();

    const weeks = [];
    let currentWeek = new Array(firstDay).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const level = getActivityLevel(dateStr, sessionDates);
      currentWeek.push({ day, level, isToday: day === today, isFuture: day > today });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    return weeks;
  }, [currentYear, currentMonth, sessionDates]);

  const activeDays = sessionDates.length > 0
    ? new Set(sessionDates).size
    : stats.totalSessions || 0;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScreenHeader
        label="ACTIVITY"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Month header */}
        <Text style={[styles.monthTitle, { color: c.textPrimary }]}>
          {MONTH_NAMES[currentMonth]} {currentYear}
        </Text>

        {/* Calendar card */}
        <Card style={styles.calendarCard}>
          {/* Weekday headers */}
          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((label, i) => (
              <Text key={i} style={[styles.weekdayLabel, { color: c.textMuted }]}>{label}</Text>
            ))}
          </View>

          {/* Calendar grid */}
          {calendarData.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {week.map((cell, dayIndex) => {
                if (!cell) {
                  return <View key={dayIndex} style={styles.emptyCell} />;
                }
                return (
                  <View
                    key={dayIndex}
                    style={[
                      styles.dayCell,
                      { backgroundColor: cell.isFuture ? 'transparent' : levelColor(cell.level) },
                      cell.isToday && { borderWidth: 2, borderColor: c.accentRust },
                    ]}
                  >
                    <Text style={[
                      styles.dayText,
                      { color: c.textSecondary },
                      cell.level > 0 && { color: c.textPrimary, fontWeight: '600' },
                      cell.level >= 3 && { color: c.textOnPrimary, fontWeight: '700' },
                      cell.isFuture && { color: c.disabled },
                      cell.isToday && { color: c.accentRust, fontWeight: '700' },
                    ]}>
                      {cell.day}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}

          {/* Legend */}
          <View style={styles.legend}>
            <Text style={[styles.legendLabel, { color: c.textMuted }]}>Less</Text>
            {[0, 1, 2, 3].map((level) => (
              <View
                key={level}
                style={[styles.legendDot, { backgroundColor: levelColor(level) }]}
              />
            ))}
            <Text style={[styles.legendLabel, { color: c.textMuted }]}>More</Text>
          </View>
        </Card>

        {/* Summary stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Ionicons name="calendar-outline" size={20} color={c.accentRust} />
            <Text style={[styles.statValue, { color: c.textPrimary }]}>{activeDays}</Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>Active days</Text>
          </Card>

          <Card style={styles.statCard}>
            <Ionicons name="flame" size={20} color={c.accentRust} />
            <Text style={[styles.statValue, { color: c.textPrimary }]}>{stats.currentStreak || 0}</Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>Current streak</Text>
          </Card>

          <Card style={styles.statCard}>
            <Ionicons name="trophy-outline" size={20} color={c.accentRust} />
            <Text style={[styles.statValue, { color: c.textPrimary }]}>{stats.longestStreak || 0}</Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>Best streak</Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  monthTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 16,
  },
  calendarCard: {
    padding: 16,
    marginBottom: 20,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6,
  },
  emptyCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
  },
  legendLabel: {
    fontSize: 11,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});
