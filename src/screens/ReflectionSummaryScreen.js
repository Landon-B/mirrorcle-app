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
import { getMoodEmoji } from '../constants/feelings';
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
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const ReflectionSummaryScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isPro } = useApp();
  const { summary, loadSummary } = useJourney();
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader label="MONTHLY REFLECTION" onBack={() => navigation.goBack()} />

      {/* Month Navigator */}
      <View style={styles.monthNav}>
        <Pressable onPress={goToPreviousMonth} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <Pressable onPress={goToNextMonth} hitSlop={12} disabled={isCurrentMonth}>
          <Ionicons
            name="chevron-forward"
            size={22}
            color={isCurrentMonth ? COLORS.textMuted : COLORS.textPrimary}
          />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.rust} />
        </View>
      ) : !summary || summary.totalSessions === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={40} color={COLORS.peach} />
          <Text style={styles.emptyTitle}>No sessions this month</Text>
          <Text style={styles.emptySubtitle}>
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
            <Text style={styles.heroText}>
              You spoke{' '}
              <Text style={styles.heroBold}>
                {summary.totalAffirmations} truth{summary.totalAffirmations !== 1 ? 's' : ''}
              </Text>
              {' '}about yourself this month.
            </Text>
          </View>

          {/* Focus summary */}
          {summary.topFocus && (
            <Card style={styles.summaryCard}>
              <Text style={styles.cardEmoji}>{summary.topFocus.emoji}</Text>
              <Text style={styles.cardText}>
                Your most common focus was{' '}
                <Text style={styles.cardBold}>{summary.topFocus.label.toLowerCase()}</Text>.
              </Text>
            </Card>
          )}

          {/* Mood journey */}
          {summary.moodShiftCount > 0 && (
            <Card style={styles.summaryCard}>
              <Text style={styles.cardText}>
                Your mood shifted in a positive direction{' '}
                <Text style={styles.cardBold}>{summary.moodShiftCount} time{summary.moodShiftCount !== 1 ? 's' : ''}</Text>.
              </Text>
            </Card>
          )}

          {/* Consistency */}
          <Card style={styles.summaryCard}>
            <Text style={styles.cardText}>
              You showed up{' '}
              <Text style={styles.cardBold}>
                {summary.activeDays} out of {summary.totalDays} days
              </Text>.
            </Text>
            <View style={styles.miniBar}>
              <View
                style={[
                  styles.miniBarFill,
                  { width: `${(summary.activeDays / summary.totalDays) * 100}%` },
                ]}
              />
            </View>
          </Card>

          {/* Session time */}
          <Card style={styles.summaryCard}>
            <Text style={styles.cardText}>
              <Text style={styles.cardBold}>{summary.totalSessions} sessions</Text>
              {' '}totaling{' '}
              <Text style={styles.cardBold}>{summary.totalMinutes} minutes</Text>
              {' '}of presence.
            </Text>
          </Card>

          {/* Milestones earned */}
          {summary.milestones && summary.milestones.length > 0 && (
            <Card style={styles.summaryCard}>
              <View style={styles.milestonesRow}>
                <Ionicons name="trophy" size={16} color={COLORS.rust} />
                <Text style={styles.cardText}>
                  {summary.milestones.length} milestone{summary.milestones.length !== 1 ? 's' : ''} earned this month.
                </Text>
              </View>
            </Card>
          )}

          {/* Premium gate for non-pro */}
          {!isPro && (
            <View style={styles.premiumGate}>
              <View style={styles.premiumOverlay}>
                <Ionicons name="lock-closed" size={24} color={COLORS.rust} />
                <Text style={styles.premiumTitle}>Unlock Monthly Reflections</Text>
                <Text style={styles.premiumSubtitle}>
                  See deeper patterns and track your transformation over time.
                </Text>
                <PrimaryButton
                  title="Deepen Your Practice"
                  onPress={() => navigation.navigate('Paywall')}
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
    color: COLORS.textPrimary,
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
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 34,
  },
  heroBold: {
    fontWeight: '700',
    color: COLORS.rust,
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
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },
  cardBold: {
    fontWeight: '700',
    color: COLORS.rust,
  },

  // Mini progress bar
  miniBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0ECE7',
    marginTop: 12,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.rust,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
