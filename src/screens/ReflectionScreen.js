import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton, GhostButton, Card } from '../components/common';
import { MilestoneCard, PowerPhraseCard, GrowthNudgeCard, MoodJourneyCard } from '../components/personalization';
import { useApp } from '../context/AppContext';
import { usePersonalization } from '../hooks/usePersonalization';
import { quotesService } from '../services/quotes';
import { formatTime } from '../utils/dateUtils';

const defaultQuote = {
  text: "The mirror reflects what we show it, but affirmations shape what we become.",
  author: null,
};

export const ReflectionScreen = ({ navigation, route }) => {
  const { stats, isPro } = useApp();
  const {
    streakEncouragement,
    milestones,
    powerPhrase,
    growthNudge,
    checkNewMilestones,
    dismissMilestone,
    getSessionComparison,
  } = usePersonalization();

  const [quote, setQuote] = useState(defaultQuote);
  const [sessionComparison, setSessionComparison] = useState(null);
  const [dismissedNudge, setDismissedNudge] = useState(false);

  const sessionDuration = route?.params?.sessionDuration || 0;
  const completedCount = route?.params?.completedCount || 0;

  useEffect(() => {
    loadQuote();
    checkNewMilestones();
    loadSessionComparison();
  }, []);

  const loadQuote = async () => {
    try {
      const randomQuote = await quotesService.getRandomForScreen({
        screen: 'reflection',
        isPro,
      });
      if (randomQuote) {
        setQuote(randomQuote);
      }
    } catch (error) {
      console.log('Using default quote:', error.message);
    }
  };

  const loadSessionComparison = async () => {
    if (sessionDuration > 0) {
      const comparison = await getSessionComparison(sessionDuration);
      setSessionComparison(comparison);
    }
  };

  const statCards = [
    { label: 'Total Sessions', value: stats.totalSessions, colors: ['#C17666', '#E8A090'], icon: 'sparkles' },
    { label: 'Affirmations Spoken', value: stats.totalAffirmations, colors: ['#FB7185', '#F43F5E'], icon: 'heart' },
    { label: 'Current Streak', value: `${stats.currentStreak} days`, colors: ['#22C55E', '#10B981'], icon: 'trending-up' },
    { label: 'Last Session', value: stats.lastSessionDate ? new Date(stats.lastSessionDate).toLocaleDateString() : 'Today', colors: ['#3B82F6', '#06B6D4'], icon: 'calendar' },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.reflectionContainer}>
          <View style={styles.reflectionHeader}>
            <LinearGradient colors={['#C17666', '#E8A090']} style={styles.reflectionBadge}>
              <Ionicons name="trophy" size={28} color="#fff" />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Reflection Room</Text>
            <Text style={styles.sectionSubtitle}>{streakEncouragement}</Text>
          </View>

          {/* Session Insights */}
          {sessionComparison && (
            <Card style={styles.insightsCard}>
              <View style={styles.insightsHeader}>
                <Ionicons name="analytics" size={18} color="#60A5FA" />
                <Text style={styles.insightsTitle}>Session Insights</Text>
              </View>
              <Text style={styles.insightsText}>
                {sessionComparison.durationDiff > 0
                  ? `This session was ${formatTime(sessionComparison.durationDiff)} longer than your average`
                  : sessionComparison.durationDiff < 0
                    ? `This session was ${formatTime(Math.abs(sessionComparison.durationDiff))} shorter than your average`
                    : 'Right on pace with your average session'}
                {completedCount > 0 && ` — you spoke ${completedCount} affirmations.`}
              </Text>
            </Card>
          )}

          <View style={styles.statsGrid}>
            {statCards.map((stat) => (
              <Card key={stat.label} style={styles.statCard}>
                <View style={styles.statCardRow}>
                  <View>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                    <Text style={styles.statValue}>{stat.value}</Text>
                  </View>
                  <LinearGradient colors={stat.colors} style={styles.statIconWrap}>
                    <Ionicons name={stat.icon} size={18} color="#fff" />
                  </LinearGradient>
                </View>
              </Card>
            ))}
          </View>

          {/* Milestones */}
          {milestones.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.milestonesScroll}>
              <View style={styles.milestonesRow}>
                {milestones.map((milestone) => (
                  <MilestoneCard
                    key={milestone.key}
                    title={milestone.title}
                    description={milestone.description}
                    onDismiss={() => dismissMilestone(milestone.key)}
                  />
                ))}
              </View>
            </ScrollView>
          )}

          {/* Mood Journey */}
          <MoodJourneyCard />

          {/* Growth Nudge */}
          {growthNudge && !dismissedNudge && (
            <GrowthNudgeCard
              message={growthNudge.message}
              onDismiss={() => setDismissedNudge(true)}
            />
          )}

          {/* Power Phrase */}
          {powerPhrase && (
            <PowerPhraseCard
              text={powerPhrase.text}
              count={powerPhrase.count}
              colors={powerPhrase.colors}
            />
          )}

          <Card style={styles.quoteCard}>
            <Text style={styles.quoteText}>
              "{quote.text}"
            </Text>
            {quote.author && (
              <Text style={styles.quoteAuthor}>— {quote.author}</Text>
            )}
          </Card>

          <View style={styles.rowButtons}>
            <PrimaryButton
              title="Start New Session"
              icon="sparkles"
              onPress={() => navigation.navigate('Feelings')}
            />
            <GhostButton title="Return Home" onPress={() => navigation.navigate('AffirmationHome')} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2EE' },
  safeArea: { flex: 1 },
  reflectionContainer: { padding: 20, gap: 16 },
  reflectionHeader: { alignItems: 'center', gap: 12 },
  reflectionBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { color: '#2D2A26', fontSize: 30, fontWeight: '700', textAlign: 'center' },
  sectionSubtitle: { color: '#7A756E', marginTop: 8, textAlign: 'center' },
  insightsCard: { gap: 8 },
  insightsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  insightsTitle: { color: '#60A5FA', fontSize: 14, fontWeight: '600' },
  insightsText: { color: '#7A756E', fontSize: 13, lineHeight: 18 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '48%' },
  statCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { color: '#7A756E', fontSize: 12 },
  statValue: { color: '#2D2A26', fontSize: 18, fontWeight: '600', marginTop: 6 },
  statIconWrap: { padding: 8, borderRadius: 12 },
  milestonesScroll: { marginHorizontal: -20 },
  milestonesRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20 },
  quoteCard: { paddingVertical: 22 },
  quoteText: { color: '#2D2A26', fontSize: 16, fontStyle: 'italic', textAlign: 'center', lineHeight: 24 },
  quoteAuthor: { color: '#7A756E', fontSize: 14, textAlign: 'center', marginTop: 8 },
  rowButtons: { gap: 12, marginTop: 8 },
});
