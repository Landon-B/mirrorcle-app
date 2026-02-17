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
import { useColors } from '../hooks/useColors';
import { useTheme } from '../context/ThemeContext';
import { getFocusAreaById, FOCUS_AREAS } from '../constants/focusAreas';
import { typography } from '../styles/typography';

const SERIF_ITALIC = Platform.OS === 'ios' ? 'Georgia-Italic' : 'serif';

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

const SettingsRow = ({ icon, label, detail, onPress, textColor, showChevron = true, c }) => (
  <Pressable
    style={({ pressed }) => [styles.settingsRow, pressed && { backgroundColor: c.surfaceSecondary }]}
    onPress={onPress}
  >
    <View style={styles.settingsRowLeft}>
      <View style={[styles.iconCircle, { backgroundColor: c.accentPeach }]}>
        <Ionicons name={icon} size={20} color={c.accentRust} />
      </View>
      <Text style={[styles.settingsLabel, { color: c.textPrimary }, textColor && { color: textColor }]}>
        {label}
      </Text>
    </View>
    <View style={styles.settingsRowRight}>
      {detail ? (
        <Text style={[styles.settingsDetail, { color: c.textMuted }]}>{detail}</Text>
      ) : null}
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color={c.border} />
      )}
    </View>
  </Pressable>
);

const SectionHeader = ({ title, c }) => (
  <Text style={[styles.sectionHeader, { color: c.textSecondary }]}>{title}</Text>
);

const APPEARANCE_OPTIONS = [
  { value: 'light', icon: 'sunny', label: 'Light' },
  { value: 'dark', icon: 'moon', label: 'Dark' },
  { value: 'system', icon: 'phone-portrait-outline', label: 'Auto' },
];

const AppearancePicker = ({ selected, onSelect, c }) => (
  <View style={[appearanceStyles.container, { backgroundColor: c.surfaceTertiary }]}>
    {APPEARANCE_OPTIONS.map((opt) => {
      const isActive = selected === opt.value;
      return (
        <Pressable
          key={opt.value}
          onPress={() => onSelect(opt.value)}
          style={[
            appearanceStyles.option,
            isActive && [appearanceStyles.optionActive, { backgroundColor: c.surface }],
          ]}
        >
          <Ionicons
            name={opt.icon}
            size={16}
            color={isActive ? c.accentRust : c.textMuted}
          />
          <Text
            style={[
              appearanceStyles.label,
              { color: isActive ? c.textPrimary : c.textMuted },
              isActive && { fontWeight: '600' },
            ]}
          >
            {opt.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

export const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, preferences, stats, sessions, signOut } = useApp();
  const { powerPhrase } = usePersonalization();
  const { favoritesCount } = useFavorites();
  const { appearancePref, setAppearance } = useTheme();
  const c = useColors();

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
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.background }]}>
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
                  borderColor: c.accentRust,
                  borderWidth: journeyProgress > 0 ? 2.5 : 0,
                  opacity: 0.3 + (journeyProgress * 0.7),
                },
              ]} />
            </View>
            <View style={[styles.avatar, { backgroundColor: c.accentPeach }]}>
              <Text style={[styles.avatarText, { color: c.accentRust }]}>{getInitials(userName)}</Text>
            </View>
          </View>
          <Text style={[styles.userName, { color: c.textPrimary }]}>{userName}</Text>
          {userEmail ? (
            <Text style={[styles.userEmail, { color: c.textSecondary }]}>{userEmail}</Text>
          ) : null}
          {isPro && (
            <View style={[styles.proBadge, { backgroundColor: c.accentRust }]}>
              <Ionicons name="star" size={12} color={c.textOnPrimary} />
              <Text style={[styles.proBadgeText, { color: c.textOnPrimary }]}>PRO</Text>
            </View>
          )}
          <Text style={[styles.journeyHeadline, { color: c.textSecondary }]}>{journeyHeadline}</Text>
        </Animated.View>

        {/* Your Story So Far — only show if user has done at least one session */}
        {stats.totalSessions > 0 && (
          <Animated.View entering={FadeInUp.delay(200).duration(500)}>
            <Pressable
              onPress={() => navigation.navigate('GrowthTab', { screen: 'GrowthDashboard' })}
              style={({ pressed }) => [pressed && { opacity: 0.9 }]}
            >
              <View style={[styles.storyCard, { backgroundColor: c.surfaceSecondary, borderLeftColor: c.accentRust }]}>
                <View style={styles.storyStatsRow}>
                  <View style={styles.storyStat}>
                    <Text style={[styles.storyStatNumber, { color: c.accentRust }]}>{stats.totalSessions}</Text>
                    <Text style={[styles.storyStatLabel, { color: c.textSecondary }]}>
                      session{stats.totalSessions !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={[styles.storyDivider, { backgroundColor: c.border }]} />
                  <View style={styles.storyStat}>
                    <Text style={[styles.storyStatNumber, { color: c.accentRust }]}>{stats.totalAffirmations}</Text>
                    <Text style={[styles.storyStatLabel, { color: c.textSecondary }]}>
                      truth{stats.totalAffirmations !== 1 ? 's' : ''} spoken
                    </Text>
                  </View>
                  {totalTime && (
                    <>
                      <View style={[styles.storyDivider, { backgroundColor: c.border }]} />
                      <View style={styles.storyStat}>
                        <Text style={[styles.storyStatNumber, { color: c.accentRust }]}>{totalTime}</Text>
                        <Text style={[styles.storyStatLabel, { color: c.textSecondary }]}>of presence</Text>
                      </View>
                    </>
                  )}
                </View>

                {/* Power phrase — most resonant affirmation */}
                {powerPhrase && (
                  <View style={styles.powerPhraseSection}>
                    <View style={[styles.thinDivider, { backgroundColor: c.border }]} />
                    <View style={styles.powerPhraseRow}>
                      <View style={[styles.powerPhraseIcon, { backgroundColor: c.accentPeach + '30' }]}>
                        <Ionicons name="mic" size={14} color={c.accentRust} />
                      </View>
                      <View style={styles.powerPhraseContent}>
                        <Text style={[styles.powerPhraseText, { color: c.textPrimary }]} numberOfLines={2}>
                          "{powerPhrase.text}"
                        </Text>
                        <Text style={[styles.powerPhraseContext, { color: c.accentRust }]}>
                          Spoken {powerPhrase.count} times — your anchor phrase
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.storyViewMore}>
                  <Text style={[styles.storyViewMoreText, { color: c.accentRust }]}>View your growth</Text>
                  <Ionicons name="arrow-forward" size={14} color={c.accentRust} />
                </View>
              </View>
            </Pressable>
          </Animated.View>
        )}

        {/* Your Mirror */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          <SectionHeader title="Your Mirror" c={c} />
          <View style={[styles.sectionCard, { backgroundColor: c.surface }]}>
            <SettingsRow
              icon="heart-outline"
              label="Favorites"
              detail={favoritesCount > 0 ? `${favoritesCount} saved` : null}
              onPress={() => navigation.navigate('Favorites')}
              c={c}
            />
            <View style={[styles.divider, { backgroundColor: c.border }]} />
            <SettingsRow
              icon="create-outline"
              label="My Affirmations"
              onPress={() => navigation.navigate('CustomAffirmations')}
              c={c}
            />
            <View style={[styles.divider, { backgroundColor: c.border }]} />
            <SettingsRow
              icon="color-palette-outline"
              label="Themes"
              onPress={() => navigation.navigate('Themes')}
              c={c}
            />
            <View style={[styles.divider, { backgroundColor: c.border }]} />
            <View style={appearanceStyles.wrapper}>
              <View style={appearanceStyles.topRow}>
                <View style={[styles.iconCircle, { backgroundColor: c.accentPeach }]}>
                  <Ionicons name="contrast-outline" size={20} color={c.accentRust} />
                </View>
                <Text style={[styles.settingsLabel, { color: c.textPrimary }]}>Appearance</Text>
              </View>
              <AppearancePicker selected={appearancePref} onSelect={setAppearance} c={c} />
            </View>
            <View style={[styles.divider, { backgroundColor: c.border }]} />
            <SettingsRow
              icon="notifications-outline"
              label="Reminders"
              onPress={() => navigation.navigate('NotificationSettings')}
              c={c}
            />
          </View>
        </Animated.View>

        {/* Account Section */}
        <Animated.View entering={FadeInUp.delay(600).duration(500)}>
          <SectionHeader title="Account" c={c} />
          <View style={[styles.sectionCard, { backgroundColor: c.surface }]}>
            {!isPro && (
              <>
                <Pressable
                  style={({ pressed }) => [
                    styles.deepenRow,
                    pressed && { backgroundColor: c.surfaceSecondary },
                  ]}
                  onPress={openPaywall}
                >
                  <LinearGradient
                    colors={[c.accentRust, c.feelingPink]}
                    style={styles.deepenIconCircle}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="sparkles" size={18} color={c.textOnPrimary} />
                  </LinearGradient>
                  <View style={styles.deepenTextContainer}>
                    <Text style={[styles.deepenLabel, { color: c.accentRust }]}>Deepen Your Journey</Text>
                    <Text style={[styles.deepenSubtitle, { color: c.textMuted }]}>Unlock the full mirror</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={c.border} />
                </Pressable>
                <View style={[styles.divider, { backgroundColor: c.border }]} />
              </>
            )}
            <SettingsRow
              icon="shield-checkmark-outline"
              label="Privacy & Security"
              onPress={() => navigation.navigate('Privacy')}
              c={c}
            />
            <View style={[styles.divider, { backgroundColor: c.border }]} />
            <SettingsRow
              icon="log-out-outline"
              label="Sign Out"
              textColor={c.error}
              onPress={handleSignOut}
              showChevron={false}
              c={c}
            />
          </View>
        </Animated.View>

        {/* Quiet closing affirmation */}
        <Animated.View entering={FadeIn.delay(800).duration(600)}>
          <Text style={[styles.closingAffirmation, { color: c.textMuted }]}>
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
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 8,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  journeyHeadline: {
    fontFamily: SERIF_ITALIC,
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
    lineHeight: 22,
  },

  // Your Story So Far
  storyCard: {
    borderRadius: 20,
    borderLeftWidth: 4,
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
    marginBottom: 2,
    textAlign: 'center',
  },
  storyStatLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  storyDivider: {
    width: 1,
    height: 28,
  },
  powerPhraseSection: {
    marginTop: 4,
  },
  thinDivider: {
    height: 1,
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
    lineHeight: 22,
    marginBottom: 4,
  },
  powerPhraseContext: {
    fontSize: 11,
    fontWeight: '500',
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
  },

  // Sections
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 8,
    marginLeft: 4,
  },
  sectionCard: {
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingsDetail: {
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
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
  },
  deepenSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },

  // Closing affirmation
  closingAffirmation: {
    fontFamily: SERIF_ITALIC,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },

  // Footer
  footer: {
    height: 20,
  },
});

const appearanceStyles = StyleSheet.create({
  wrapper: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  container: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    marginLeft: 50,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    gap: 5,
  },
  optionActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
});
