import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { usePaywall } from '../hooks/usePaywall';
import { usePersonalization } from '../hooks/usePersonalization';
import { useFavorites } from '../hooks/useFavorites';
import { getFocusAreaById, FOCUS_AREAS } from '../constants/focusAreas';
import { typography } from '../styles/typography';

const SERIF_ITALIC = Platform.OS === 'ios' ? 'Georgia-Italic' : 'serif';

const COLORS = {
  background: '#F5F2EE',
  card: '#FFFFFF',
  textPrimary: '#2D2A26',
  textSecondary: '#7A756E',
  textMuted: '#B0AAA2',
  accent: '#C17666',
  accentLight: '#E8A090',
  peach: '#E8D0C6',
  warmTint: '#FDF5F2',
  border: '#E8E4DF',
  surfaceTertiary: '#F0ECE7',
  signOut: '#EF4444',
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

const formatTotalTime = (seconds) => {
  if (!seconds || seconds < 60) return null;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours >= 1) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
};

/**
 * Build a personal headline from the user's journey data.
 */
const getJourneyHeadline = (stats, sessions) => {
  if (stats.totalSessions === 0) {
    return 'Your journey begins whenever you\'re ready.';
  }
  if (stats.currentStreak >= 7) {
    return `${stats.currentStreak} days of choosing yourself.`;
  }
  if (stats.currentStreak >= 2) {
    return `${stats.currentStreak} days of showing up.`;
  }
  if (stats.totalSessions === 1) {
    return 'You took the first step.';
  }

  // Find most-used focus area from sessions
  const focusCounts = {};
  sessions.forEach(s => {
    const fid = s.focusAreaId || s.feeling;
    if (fid) focusCounts[fid] = (focusCounts[fid] || 0) + 1;
  });
  const topFocus = Object.entries(focusCounts).sort((a, b) => b[1] - a[1])[0];
  if (topFocus) {
    const area = getFocusAreaById(topFocus[0]);
    if (area) return `You keep coming back to ${area.label}.`;
  }

  return `${stats.totalSessions} sessions of self-reflection.`;
};

const SettingsRow = ({ icon, label, detail, onPress, textColor, showChevron = true }) => (
  <Pressable
    style={({ pressed }) => [styles.settingsRow, pressed && styles.settingsRowPressed]}
    onPress={onPress}
  >
    <View style={styles.settingsRowLeft}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={20} color={COLORS.accent} />
      </View>
      <Text style={[styles.settingsLabel, textColor && { color: textColor }]}>
        {label}
      </Text>
    </View>
    <View style={styles.settingsRowRight}>
      {detail ? (
        <Text style={styles.settingsDetail}>{detail}</Text>
      ) : null}
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
      )}
    </View>
  </Pressable>
);

const SectionHeader = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

export const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, preferences, stats, sessions, signOut } = useApp();
  const { powerPhrase } = usePersonalization();
  const { favoritesCount } = useFavorites();

  const userName = user?.user_metadata?.name || preferences?.name || 'You';
  const userEmail = user?.email || '';
  const isPro = preferences?.isPro || false;
  const { openPaywall } = usePaywall();

  const journeyHeadline = useMemo(
    () => getJourneyHeadline(stats, sessions),
    [stats, sessions]
  );

  const totalTime = useMemo(() => formatTotalTime(stats.totalTimeSeconds), [stats.totalTimeSeconds]);

  // Journey ring progress (0-1) based on milestones / session count
  const journeyProgress = useMemo(() => {
    if (stats.totalSessions === 0) return 0;
    // Gentle log curve — reaches ~0.5 at 10 sessions, ~0.8 at 50, ~0.95 at 100
    return Math.min(1, Math.log10(stats.totalSessions + 1) / 2.1);
  }, [stats.totalSessions]);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header — Personal & Warm */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {/* Journey ring */}
            <View style={styles.journeyRingOuter}>
              <View style={[
                styles.journeyRingFill,
                {
                  // Use border trick for circular progress
                  borderColor: COLORS.accent,
                  borderWidth: journeyProgress > 0 ? 2.5 : 0,
                  opacity: 0.3 + (journeyProgress * 0.7),
                },
              ]} />
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(userName)}</Text>
            </View>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          {userEmail ? (
            <Text style={styles.userEmail}>{userEmail}</Text>
          ) : null}
          {isPro && (
            <View style={styles.proBadge}>
              <Ionicons name="star" size={12} color="#FFFFFF" />
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          )}
          <Text style={styles.journeyHeadline}>{journeyHeadline}</Text>
        </Animated.View>

        {/* Your Story So Far — only show if user has done at least one session */}
        {stats.totalSessions > 0 && (
          <Animated.View entering={FadeInUp.delay(200).duration(500)}>
            <Pressable
              onPress={() => navigation.navigate('GrowthTab', { screen: 'GrowthDashboard' })}
              style={({ pressed }) => [pressed && { opacity: 0.9 }]}
            >
              <View style={styles.storyCard}>
                <View style={styles.storyStatsRow}>
                  <View style={styles.storyStat}>
                    <Text style={styles.storyStatNumber}>{stats.totalSessions}</Text>
                    <Text style={styles.storyStatLabel}>
                      session{stats.totalSessions !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.storyDivider} />
                  <View style={styles.storyStat}>
                    <Text style={styles.storyStatNumber}>{stats.totalAffirmations}</Text>
                    <Text style={styles.storyStatLabel}>
                      truth{stats.totalAffirmations !== 1 ? 's' : ''} spoken
                    </Text>
                  </View>
                  {totalTime && (
                    <>
                      <View style={styles.storyDivider} />
                      <View style={styles.storyStat}>
                        <Text style={styles.storyStatNumber}>{totalTime}</Text>
                        <Text style={styles.storyStatLabel}>of presence</Text>
                      </View>
                    </>
                  )}
                </View>

                {/* Power phrase — most resonant affirmation */}
                {powerPhrase && (
                  <View style={styles.powerPhraseSection}>
                    <View style={styles.thinDivider} />
                    <View style={styles.powerPhraseRow}>
                      <View style={styles.powerPhraseIcon}>
                        <Ionicons name="mic" size={14} color={COLORS.accent} />
                      </View>
                      <View style={styles.powerPhraseContent}>
                        <Text style={styles.powerPhraseText} numberOfLines={2}>
                          "{powerPhrase.text}"
                        </Text>
                        <Text style={styles.powerPhraseContext}>
                          Spoken {powerPhrase.count} times — your anchor phrase
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.storyViewMore}>
                  <Text style={styles.storyViewMoreText}>View your growth</Text>
                  <Ionicons name="arrow-forward" size={14} color={COLORS.accent} />
                </View>
              </View>
            </Pressable>
          </Animated.View>
        )}

        {/* Your Mirror */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          <SectionHeader title="Your Mirror" />
          <View style={styles.sectionCard}>
            <SettingsRow
              icon="heart-outline"
              label="Favorites"
              detail={favoritesCount > 0 ? `${favoritesCount} saved` : null}
              onPress={() => navigation.navigate('Favorites')}
            />
            <View style={styles.divider} />
            <SettingsRow
              icon="create-outline"
              label="My Affirmations"
              onPress={() => navigation.navigate('CustomAffirmations')}
            />
            <View style={styles.divider} />
            <SettingsRow
              icon="color-palette-outline"
              label="Themes"
              onPress={() => navigation.navigate('Themes')}
            />
            <View style={styles.divider} />
            <SettingsRow
              icon="notifications-outline"
              label="Reminders"
              onPress={() => navigation.navigate('NotificationSettings')}
            />
          </View>
        </Animated.View>

        {/* Account Section */}
        <Animated.View entering={FadeInUp.delay(600).duration(500)}>
          <SectionHeader title="Account" />
          <View style={styles.sectionCard}>
            {!isPro && (
              <>
                <Pressable
                  style={({ pressed }) => [
                    styles.deepenRow,
                    pressed && styles.settingsRowPressed,
                  ]}
                  onPress={openPaywall}
                >
                  <LinearGradient
                    colors={[COLORS.accent, COLORS.accentLight]}
                    style={styles.deepenIconCircle}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                  </LinearGradient>
                  <View style={styles.deepenTextContainer}>
                    <Text style={styles.deepenLabel}>Deepen Your Journey</Text>
                    <Text style={styles.deepenSubtitle}>Unlock the full mirror</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
                </Pressable>
                <View style={styles.divider} />
              </>
            )}
            <SettingsRow
              icon="shield-checkmark-outline"
              label="Privacy & Security"
              onPress={() => navigation.navigate('Privacy')}
            />
            <View style={styles.divider} />
            <SettingsRow
              icon="log-out-outline"
              label="Sign Out"
              textColor={COLORS.signOut}
              onPress={handleSignOut}
              showChevron={false}
            />
          </View>
        </Animated.View>

        {/* Quiet closing affirmation */}
        <Animated.View entering={FadeIn.delay(800).duration(600)}>
          <Text style={styles.closingAffirmation}>
            You are worth the time you give yourself here.
          </Text>
        </Animated.View>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  journeyRingOuter: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
  },
  journeyRingFill: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderColor: COLORS.accent,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.accent,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 8,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  journeyHeadline: {
    fontFamily: SERIF_ITALIC,
    fontSize: 15,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
    lineHeight: 22,
  },

  // Your Story So Far
  storyCard: {
    backgroundColor: COLORS.warmTint,
    borderRadius: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  storyStatsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyStat: {
    alignItems: 'center',
    flex: 1,
  },
  storyStatNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.accent,
    marginBottom: 2,
  },
  storyStatLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  storyDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
  powerPhraseSection: {
    marginTop: 4,
  },
  thinDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  powerPhraseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  powerPhraseIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(193, 118, 102, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  powerPhraseContent: {
    flex: 1,
  },
  powerPhraseText: {
    fontFamily: SERIF_ITALIC,
    fontSize: 15,
    fontStyle: 'italic',
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 4,
  },
  powerPhraseContext: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.accent,
    letterSpacing: 0.3,
  },
  storyViewMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 14,
  },
  storyViewMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
  },

  // Sections
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },

  // Settings Row
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingsRowPressed: {
    backgroundColor: '#F9F7F5',
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  settingsRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  settingsDetail: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginLeft: 66,
  },

  // Deepen Your Journey row
  deepenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  deepenIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deepenTextContainer: {
    flex: 1,
  },
  deepenLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent,
  },
  deepenSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginTop: 1,
  },

  // Closing affirmation
  closingAffirmation: {
    fontFamily: SERIF_ITALIC,
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },

  // Footer
  footer: {
    height: 20,
  },
});
