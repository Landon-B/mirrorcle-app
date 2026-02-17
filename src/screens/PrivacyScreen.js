import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ScreenHeader } from '../components/common';
import { shadows } from '../styles/spacing';
import { useColors } from '../hooks/useColors';

const PrivacyRow = ({ icon, title, description, onPress, destructive, c }) => (
  <Pressable
    style={({ pressed }) => [styles.row, pressed && { backgroundColor: c.surfaceSecondary }]}
    onPress={onPress}
  >
    <View style={[styles.rowIcon, { backgroundColor: c.accentPeach }, destructive && { backgroundColor: `${c.error}1A` }]}>
      <Ionicons
        name={icon}
        size={20}
        color={destructive ? c.error : c.accentRust}
      />
    </View>
    <View style={styles.rowContent}>
      <Text style={[styles.rowTitle, { color: c.textPrimary }, destructive && { color: c.error }]}>
        {title}
      </Text>
      {description && (
        <Text style={[styles.rowDescription, { color: c.textMuted }]}>{description}</Text>
      )}
    </View>
    <Ionicons name="chevron-forward" size={18} color={c.disabled} />
  </Pressable>
);

export const PrivacyScreen = ({ navigation }) => {
  const { user } = useApp();
  const c = useColors();

  const handleExportData = () => {
    Alert.alert(
      'Export Your Data',
      'We will prepare a copy of all your data. This may take a moment.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => {
          Alert.alert('Data Export', 'Your data export has been initiated. You will receive it via email shortly.');
        }},
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'Please contact support@mirrorcle.app to complete account deletion.');
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScreenHeader
        label="PRIVACY"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: c.textPrimary }]}>Privacy & Security</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          Your data, your control
        </Text>

        {/* Privacy info card */}
        <View style={[styles.infoCard, { backgroundColor: c.surface }]}>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={20} color={c.success} />
            <Text style={[styles.infoText, { color: c.textPrimary }]}>
              Your camera feed is never recorded or stored
            </Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: c.surfaceTertiary }]} />
          <View style={styles.infoRow}>
            <Ionicons name="lock-closed" size={20} color={c.success} />
            <Text style={[styles.infoText, { color: c.textPrimary }]}>
              All data is encrypted in transit and at rest
            </Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: c.surfaceTertiary }]} />
          <View style={styles.infoRow}>
            <Ionicons name="eye-off" size={20} color={c.success} />
            <Text style={[styles.infoText, { color: c.textPrimary }]}>
              We never sell your personal information
            </Text>
          </View>
        </View>

        {/* Actions section */}
        <Text style={[styles.sectionTitle, { color: c.textMuted }]}>YOUR DATA</Text>
        <View style={[styles.sectionCard, { backgroundColor: c.surface }]}>
          <PrivacyRow
            icon="document-text-outline"
            title="Privacy Policy"
            description="Read our full privacy policy"
            onPress={() => Linking.openURL('https://mirrorcle.app/privacy')}
            c={c}
          />
          <View style={[styles.divider, { backgroundColor: c.border }]} />
          <PrivacyRow
            icon="document-outline"
            title="Terms of Service"
            description="Review our terms"
            onPress={() => Linking.openURL('https://mirrorcle.app/terms')}
            c={c}
          />
          <View style={[styles.divider, { backgroundColor: c.border }]} />
          <PrivacyRow
            icon="download-outline"
            title="Export My Data"
            description="Download a copy of all your data"
            onPress={handleExportData}
            c={c}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: c.textMuted }]}>DANGER ZONE</Text>
        <View style={[styles.sectionCard, { backgroundColor: c.surface }]}>
          <PrivacyRow
            icon="trash-outline"
            title="Delete My Account"
            description="Permanently remove all your data"
            onPress={handleDeleteAccount}
            destructive
            c={c}
          />
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
  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  infoCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    ...shadows.card,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  infoDivider: {
    height: 1,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  rowDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 66,
  },
});
