import React, { useState, useEffect } from 'react';
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
import { useJourney } from '../hooks/useJourney';
import { useColors } from '../hooks/useColors';
import { getMoodEmoji } from '../constants/feelings';
import { usePaywall } from '../hooks/usePaywall';
import { typography } from '../styles/typography';
import { shadows } from '../styles/spacing';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const ReflectionSummaryScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isPro } = useApp();
  const { openPaywall } = usePaywall();
  const { summary, loadSummary } = useJourney();
  const c = useColors();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const isCurrentMonth =
    currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear();

  useEffect(() => {
    load();
  }, [currentDate]);

  const load = async () => {
    setLoading(true);
    await loadSummary('month', currentDate);
    setLoading(false);
  };

  const goToPreviousMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentDate(prev);
  };

  const goToNextMonth = () => {
    if (isCurrentMonth) return;
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  const monthLabel = `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <ScreenHeader label="MONTHLY REFLECTION" onBack={() => navigation.goBack()} />

      {/* Month Navigator */}
      <View style={styles.monthNav}>
        <Pressable onPress={goToPreviousMonth} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={c.textPrimary} />
        </Pressable>
        <Text style={[styles.monthLabel, { color: c.textPrimary }]}>{monthLabel}</Text>
        <Pressable onPress={goToNextMonth} hitSlop={12} disabled={isCurrentMonth}>
          <Ionicons
            name="chevron-forward"
            size={22}
            color={isCurrentMonth ? c.textMuted : c.textPrimary}
          />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={c.accentRust} />
        </View>
      ) : !summary || summary.totalSessions === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={40} color={c.accentPeach} />
          <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>No sessions this month</Text>
          <Text style={[styles.emptySubtitle, { color: c.textSecondary }]}>
            Start a session to begin building your monthly reflection.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero stat */}
          <View style={styles.heroSection}>
            <Text style={[styles.heroText, { color: c.textPrimary }]}>
              You spoke{' '}
              <Text style={[styles.heroBold, { color: c.accentRust }]}>
                {summary.totalAffirmations} truth{summary.totalAffirmations !== 1 ? 's' : ''}
              </Text>
              {' '}about yourself this month.
            </Text>
          </View>

          {/* Focus summary */}
          {summary.topFocus && (
            <Card style={styles.summaryCard}>
              <Text style={styles.cardEmoji}>{summary.topFocus.emoji}</Text>
              <Text style={[styles.cardText, { color: c.textPrimary }]}>
                Your most common focus was{' '}
                <Text style={[styles.cardBold, { color: c.accentRust }]}>{summary.topFocus.label.toLowerCase()}</Text>.
              </Text>
            </Card>
          )}

          {/* Mood journey */}
          {summary.moodShiftCount > 0 && (
            <Card style={styles.summaryCard}>
              <Text style={[styles.cardText, { color: c.textPrimary }]}>
                Your mood shifted in a positive direction{' '}
                <Text style={[styles.cardBold, { color: c.accentRust }]}>{summary.moodShiftCount} time{summary.moodShiftCount !== 1 ? 's' : ''}</Text>.
              </Text>
            </Card>
          )}

          {/* Consistency */}
          <Card style={styles.summaryCard}>
            <Text style={[styles.cardText, { color: c.textPrimary }]}>
              You showed up{' '}
              <Text style={[styles.cardBold, { color: c.accentRust }]}>
                {summary.activeDays} out of {summary.totalDays} days
              </Text>.
            </Text>
            <View style={[styles.miniBar, { backgroundColor: c.surfaceTertiary }]}>
              <View
                style={[
                  styles.miniBarFill,
                  { width: `${(summary.activeDays / summary.totalDays) * 100}%`, backgroundColor: c.accentRust },
                ]}
              />
            </View>
          </Card>

          {/* Session time */}
          <Card style={styles.summaryCard}>
            <Text style={[styles.cardText, { color: c.textPrimary }]}>
              <Text style={[styles.cardBold, { color: c.accentRust }]}>{summary.totalSessions} sessions</Text>
              {' '}totaling{' '}
              <Text style={[styles.cardBold, { color: c.accentRust }]}>{summary.totalMinutes} minutes</Text>
              {' '}of presence.
            </Text>
          </Card>

          {/* Milestones earned */}
          {summary.milestones && summary.milestones.length > 0 && (
            <Card style={styles.summaryCard}>
              <View style={styles.milestonesRow}>
                <Ionicons name="trophy" size={16} color={c.accentRust} />
                <Text style={[styles.cardText, { color: c.textPrimary }]}>
                  {summary.milestones.length} milestone{summary.milestones.length !== 1 ? 's' : ''} earned this month.
                </Text>
              </View>
            </Card>
          )}

          {/* Premium gate for non-pro */}
          {!isPro && (
            <View style={styles.premiumGate}>
              <View style={[styles.premiumOverlay, { backgroundColor: c.surface }]}>
                <Ionicons name="lock-closed" size={24} color={c.accentRust} />
                <Text style={[styles.premiumTitle, { color: c.textPrimary }]}>Unlock Monthly Reflections</Text>
                <Text style={[styles.premiumSubtitle, { color: c.textSecondary }]}>
                  See deeper patterns and track your transformation over time.
                </Text>
                <PrimaryButton
                  title="Deepen Your Practice"
                  onPress={openPaywall}
                  style={styles.premiumButton}
                />
              </View>
            </View>
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

  // Month navigator
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  heroText: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 22,
    textAlign: 'center',
    lineHeight: 34,
  },
  heroBold: {
    fontWeight: '700',
  },

  // Summary cards
  summaryCard: {
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  cardBold: {
    fontWeight: '700',
  },

  // Mini progress bar
  miniBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Milestones row
  milestonesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Premium gate
  premiumGate: {
    marginTop: 8,
    marginBottom: 16,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
