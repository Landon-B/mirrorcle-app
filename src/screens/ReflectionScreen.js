import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, PrimaryButton, GhostButton, Card } from '../components/common';
import { useApp } from '../context/AppContext';

const encouragementMessages = [
  "You're showing up for yourself!",
  "Every affirmation is a step forward",
  "Your commitment to growth is inspiring",
  "Keep reflecting, keep growing",
  "You're building a beautiful practice",
];

export const ReflectionScreen = ({ navigation }) => {
  const { stats } = useApp();

  const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];

  const statCards = [
    { label: 'Total Sessions', value: stats.totalSessions, colors: ['#A855F7', '#EC4899'], icon: 'sparkles' },
    { label: 'Affirmations Spoken', value: stats.totalAffirmations, colors: ['#FB7185', '#F43F5E'], icon: 'heart' },
    { label: 'Current Streak', value: `${stats.currentStreak} days`, colors: ['#22C55E', '#10B981'], icon: 'trending-up' },
    { label: 'Last Session', value: stats.lastSessionDate ? new Date(stats.lastSessionDate).toLocaleDateString() : 'Today', colors: ['#3B82F6', '#06B6D4'], icon: 'calendar' },
  ];

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.reflectionContainer}>
          <View style={styles.reflectionHeader}>
            <LinearGradient colors={['#A855F7', '#EC4899']} style={styles.reflectionBadge}>
              <Ionicons name="award" size={28} color="#fff" />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Reflection Room</Text>
            <Text style={styles.sectionSubtitle}>{randomMessage}</Text>
          </View>

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

          {stats.feelingsHistory.length > 0 && (
            <Card style={styles.feelingsCard}>
              <View style={styles.feelingsHeader}>
                <Ionicons name="heart" size={18} color="#F472B6" />
                <Text style={styles.feelingsTitle}>Your Feelings Journey</Text>
              </View>
              <View style={styles.feelingsChips}>
                {stats.feelingsHistory.slice(-10).map((feeling, index) => (
                  <View key={`${feeling}-${index}`} style={styles.feelingChip}>
                    <Text style={styles.feelingChipText}>{feeling}</Text>
                  </View>
                ))}
              </View>
            </Card>
          )}

          <Card style={styles.quoteCard}>
            <Text style={styles.quoteText}>
              "The mirror reflects what we show it, but affirmations shape what we become."
            </Text>
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
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
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
  sectionTitle: { color: '#fff', fontSize: 30, fontWeight: '700', textAlign: 'center' },
  sectionSubtitle: { color: '#CBD5F5', marginTop: 8, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '48%' },
  statCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { color: '#94A3B8', fontSize: 12 },
  statValue: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 6 },
  statIconWrap: { padding: 8, borderRadius: 12 },
  feelingsCard: { gap: 12 },
  feelingsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  feelingsTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  feelingsChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  feelingChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.4)',
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  feelingChipText: { color: '#E9D5FF', fontSize: 12, textTransform: 'capitalize' },
  quoteCard: { paddingVertical: 22 },
  quoteText: { color: '#fff', fontSize: 16, fontStyle: 'italic', textAlign: 'center', lineHeight: 24 },
  rowButtons: { gap: 12, marginTop: 8 },
});
