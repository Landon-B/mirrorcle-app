import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const COLORS = {
  background: '#F5F2EE',
  card: '#FFFFFF',
  textPrimary: '#2D2A26',
  textSecondary: '#7A756E',
  accent: '#C17666',
  peach: '#E8D0C6',
  border: '#E8E4DF',
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

const SettingsRow = ({ icon, label, onPress, textColor, showChevron = true }) => (
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
    {showChevron && (
      <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
    )}
  </Pressable>
);

const SectionHeader = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

export const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, preferences, signOut } = useApp();

  const userName = user?.user_metadata?.name || preferences?.name || 'User';
  const userEmail = user?.email || '';
  const isPro = preferences?.isPro || false;

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
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(userName)}</Text>
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
        </View>

        {/* Your Practice Section */}
        <SectionHeader title="Your Practice" />
        <View style={styles.sectionCard}>
          <SettingsRow
            icon="heart-outline"
            label="Favorites"
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
            label="Notifications"
            onPress={() => navigation.navigate('NotificationSettings')}
          />
        </View>

        {/* Account Section */}
        <SectionHeader title="Account" />
        <View style={styles.sectionCard}>
          {!isPro && (
            <>
              <SettingsRow
                icon="star"
                label="Upgrade to Pro"
                onPress={() => navigation.getParent()?.navigate('Paywall')}
              />
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
    paddingBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.peach,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
    marginTop: 4,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
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
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginLeft: 66,
  },

  // Footer
  footer: {
    height: 20,
  },
});
