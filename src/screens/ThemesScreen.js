import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../components/common';
import { THEMES, getFreeThemes, getPremiumThemes } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { usePaywall } from '../hooks/usePaywall';
import { useColors, useGradients } from '../hooks/useColors';

export const ThemesScreen = ({ navigation }) => {
  const { theme, changeTheme } = useTheme();
  const { isPro, unlockedThemes, stats } = useApp();
  const { openPaywall } = usePaywall();
  const c = useColors();
  const g = useGradients();

  const freeThemes = getFreeThemes();
  const premiumThemes = getPremiumThemes();

  const isThemeUnlocked = (themeOption) => {
    if (!themeOption.isPremium) return true;
    if (isPro) return true;
    return unlockedThemes.includes(themeOption.id);
  };

  const getUnlockProgress = (themeOption) => {
    if (!themeOption.unlockRequirement) return null;
    const { type, value } = themeOption.unlockRequirement;

    if (type === 'streak') {
      return Math.min(1, stats.currentStreak / value);
    }
    if (type === 'sessions') {
      return Math.min(1, stats.totalSessions / value);
    }
    return 0;
  };

  const handleThemeSelect = (selectedTheme) => {
    if (selectedTheme.isPremium && !isPro && !unlockedThemes.includes(selectedTheme.id)) {
      openPaywall();
      return;
    }
    changeTheme(selectedTheme.id);
  };

  const renderThemeCard = (themeOption) => {
    const isSelected = theme.id === themeOption.id;
    const unlocked = isThemeUnlocked(themeOption);
    const isLocked = themeOption.isPremium && !unlocked;
    const progress = getUnlockProgress(themeOption);
    const isMilestoneUnlocked = !isPro && unlocked && themeOption.isPremium;

    return (
      <Pressable
        key={themeOption.id}
        onPress={() => handleThemeSelect(themeOption)}
        style={[styles.themeCard, isSelected && styles.themeCardSelected]}
      >
        <LinearGradient
          colors={themeOption.gradient}
          style={styles.themePreview}
        >
          <LinearGradient
            colors={themeOption.primary}
            style={styles.themeAccent}
          />
          {isLocked && (
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={14} color="#fff" />
            </View>
          )}
          {isMilestoneUnlocked && (
            <View style={styles.unlockedBadge}>
              <Ionicons name="trophy" size={14} color={c.warning} />
            </View>
          )}
          {isSelected && (
            <View style={[styles.checkBadge, { backgroundColor: c.success }]}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
          )}
        </LinearGradient>
        <Text style={[styles.themeName, { color: c.textPrimary }]}>{themeOption.name}</Text>
        {isLocked && themeOption.unlockRequirement && (
          <View style={styles.unlockInfo}>
            <View style={[styles.progressTrack, { backgroundColor: c.border }]}>
              <View style={[styles.progressFill, { width: `${(progress || 0) * 100}%`, backgroundColor: c.accentRust }]} />
            </View>
            <Text style={[styles.unlockLabel, { color: c.textSecondary }]}>{themeOption.unlockRequirement.label}</Text>
          </View>
        )}
        {isMilestoneUnlocked && (
          <Text style={[styles.unlockedLabel, { color: c.warning }]}>Earned</Text>
        )}
        {isLocked && !themeOption.unlockRequirement && (
          <Text style={[styles.proBadge, { color: c.warning }]}>PRO</Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
        <StatusBar barStyle={c.statusBarStyle} />
        <ScreenHeader title="Themes" onBack={() => navigation.goBack()} />

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>Free Themes</Text>
          <View style={styles.themesGrid}>
            {freeThemes.map(renderThemeCard)}
          </View>

          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>Premium Themes</Text>
          <View style={styles.themesGrid}>
            {premiumThemes.map(renderThemeCard)}
          </View>

          {!isPro && (
            <Pressable
              style={styles.upgradeCard}
              onPress={() => openPaywall()}
            >
              <LinearGradient
                colors={g.warning}
                style={styles.upgradeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="diamond" size={24} color="#fff" />
                <View style={styles.upgradeText}>
                  <Text style={styles.upgradeTitle}>Unlock Premium Themes</Text>
                  <Text style={styles.upgradeSubtitle}>Or earn them through milestones</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#fff" />
              </LinearGradient>
            </Pressable>
          )}
        </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '600', textTransform: 'uppercase' },
  themesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  themeCard: {
    width: '47%',
    alignItems: 'center',
    gap: 8,
  },
  themeCardSelected: {},
  themePreview: {
    width: '100%',
    aspectRatio: 1.2,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeAccent: {
    width: '60%',
    height: 8,
    borderRadius: 4,
  },
  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeName: { fontSize: 14, fontWeight: '500' },
  proBadge: {
    fontSize: 10,
    fontWeight: '700',
  },
  unlockInfo: { width: '100%', gap: 4 },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  unlockLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  unlockedLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  upgradeCard: { marginTop: 20 },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    gap: 16,
  },
  upgradeText: { flex: 1 },
  upgradeTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  upgradeSubtitle: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, marginTop: 2 },
});
