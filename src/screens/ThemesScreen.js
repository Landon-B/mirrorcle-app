import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { THEMES, getFreeThemes, getPremiumThemes } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

export const ThemesScreen = ({ navigation }) => {
  const { theme, changeTheme } = useTheme();
  const { isPro, unlockedThemes, stats } = useApp();

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
      navigation.navigate('Paywall');
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
              <Ionicons name="trophy" size={14} color="#F59E0B" />
            </View>
          )}
          {isSelected && (
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
          )}
        </LinearGradient>
        <Text style={styles.themeName}>{themeOption.name}</Text>
        {isLocked && themeOption.unlockRequirement && (
          <View style={styles.unlockInfo}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${(progress || 0) * 100}%` }]} />
            </View>
            <Text style={styles.unlockLabel}>{themeOption.unlockRequirement.label}</Text>
          </View>
        )}
        {isMilestoneUnlocked && (
          <Text style={styles.unlockedLabel}>Earned</Text>
        )}
        {isLocked && !themeOption.unlockRequirement && (
          <Text style={styles.proBadge}>PRO</Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color="#7A756E" />
          </Pressable>
          <Text style={styles.title}>Themes</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Free Themes</Text>
          <View style={styles.themesGrid}>
            {freeThemes.map(renderThemeCard)}
          </View>

          <Text style={styles.sectionTitle}>Premium Themes</Text>
          <View style={styles.themesGrid}>
            {premiumThemes.map(renderThemeCard)}
          </View>

          {!isPro && (
            <Pressable
              style={styles.upgradeCard}
              onPress={() => navigation.navigate('Paywall')}
            >
              <LinearGradient
                colors={['#F59E0B', '#F97316']}
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
  placeholder: { width: 40 },
  content: { padding: 20, gap: 20 },
  sectionTitle: { color: '#B0AAA2', fontSize: 14, fontWeight: '600', textTransform: 'uppercase' },
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
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeName: { color: '#2D2A26', fontSize: 14, fontWeight: '500' },
  proBadge: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '700',
  },
  unlockInfo: { width: '100%', gap: 4 },
  progressTrack: {
    height: 4,
    backgroundColor: '#E8E4DF',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#C17666',
    borderRadius: 2,
  },
  unlockLabel: {
    color: '#7A756E',
    fontSize: 10,
    textAlign: 'center',
  },
  unlockedLabel: {
    color: '#F59E0B',
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
