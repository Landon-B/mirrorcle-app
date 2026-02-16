import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ScreenHeader } from '../components/common';
import { shadows } from '../styles/spacing';

const PrivacyRow = ({ icon, title, description, onPress, destructive }) => (
  <Pressable
    style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    onPress={onPress}
  >
    <View style={[styles.rowIcon, destructive && styles.rowIconDestructive]}>
      <Ionicons
        name={icon}
        size={20}
        color={destructive ? '#EF4444' : '#C17666'}
      />
    </View>
    <View style={styles.rowContent}>
      <Text style={[styles.rowTitle, destructive && styles.rowTitleDestructive]}>
        {title}
      </Text>
      {description && (
        <Text style={styles.rowDescription}>{description}</Text>
      )}
    </View>
    <Ionicons name="chevron-forward" size={18} color="#D4CFC9" />
  </Pressable>
);

export const PrivacyScreen = ({ navigation }) => {
  const { user } = useApp();

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
    <View style={styles.container}>
      <ScreenHeader
        label="PRIVACY"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Privacy & Security</Text>
        <Text style={styles.subtitle}>
          Your data, your control
        </Text>

        {/* Privacy info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={20} color="#22C55E" />
            <Text style={styles.infoText}>
              Your camera feed is never recorded or stored
            </Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Ionicons name="lock-closed" size={20} color="#22C55E" />
            <Text style={styles.infoText}>
              All data is encrypted in transit and at rest
            </Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Ionicons name="eye-off" size={20} color="#22C55E" />
            <Text style={styles.infoText}>
              We never sell your personal information
            </Text>
          </View>
        </View>

        {/* Actions section */}
        <Text style={styles.sectionTitle}>YOUR DATA</Text>
        <View style={styles.sectionCard}>
          <PrivacyRow
            icon="document-text-outline"
            title="Privacy Policy"
            description="Read our full privacy policy"
            onPress={() => Linking.openURL('https://mirrorcle.app/privacy')}
          />
          <View style={styles.divider} />
          <PrivacyRow
            icon="document-outline"
            title="Terms of Service"
            description="Review our terms"
            onPress={() => Linking.openURL('https://mirrorcle.app/terms')}
          />
          <View style={styles.divider} />
          <PrivacyRow
            icon="download-outline"
            title="Export My Data"
            description="Download a copy of all your data"
            onPress={handleExportData}
          />
        </View>

        <Text style={styles.sectionTitle}>DANGER ZONE</Text>
        <View style={styles.sectionCard}>
          <PrivacyRow
            icon="trash-outline"
            title="Delete My Account"
            description="Permanently remove all your data"
            onPress={handleDeleteAccount}
            destructive
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2EE',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2A26',
    marginTop: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7A756E',
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
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
    color: '#2D2A26',
    flex: 1,
    lineHeight: 20,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#F0ECE7',
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B0AAA2',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
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
  rowPressed: {
    backgroundColor: '#F9F7F5',
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8D0C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconDestructive: {
    backgroundColor: '#FEE2E2',
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D2A26',
  },
  rowTitleDestructive: {
    color: '#EF4444',
  },
  rowDescription: {
    fontSize: 13,
    color: '#B0AAA2',
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E8E4DF',
    marginLeft: 66,
  },
});
