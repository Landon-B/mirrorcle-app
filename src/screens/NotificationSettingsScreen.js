import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, Card, PrimaryButton } from '../components/common';
import { useNotifications } from '../hooks/useNotifications';

const TIME_OPTIONS = [
  { label: '7:00 AM', value: '07:00' },
  { label: '8:00 AM', value: '08:00' },
  { label: '9:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '6:00 PM', value: '18:00' },
  { label: '8:00 PM', value: '20:00' },
  { label: '9:00 PM', value: '21:00' },
];

export const NotificationSettingsScreen = ({ navigation }) => {
  const {
    isEnabled,
    notificationTime,
    enableNotifications,
    disableNotifications,
    updateNotificationTime,
  } = useNotifications();

  const handleToggle = async (value) => {
    if (value) {
      await enableNotifications(notificationTime);
    } else {
      await disableNotifications();
    }
  };

  const handleTimeSelect = async (time) => {
    await updateNotificationTime(time);
    if (!isEnabled) {
      await enableNotifications(time);
    }
  };

  const formatTime = (time) => {
    const option = TIME_OPTIONS.find(t => t.value === time);
    return option?.label || time;
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Card style={styles.toggleCard}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Ionicons name="notifications" size={24} color="#A855F7" />
                <View>
                  <Text style={styles.toggleTitle}>Daily Reminders</Text>
                  <Text style={styles.toggleSubtitle}>Get reminded to practice</Text>
                </View>
              </View>
              <Switch
                value={isEnabled}
                onValueChange={handleToggle}
                trackColor={{ false: '#475569', true: '#A855F7' }}
                thumbColor="#fff"
              />
            </View>
          </Card>

          {isEnabled && (
            <Card style={styles.timeCard}>
              <Text style={styles.sectionLabel}>Reminder Time</Text>
              <View style={styles.timeGrid}>
                {TIME_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => handleTimeSelect(option.value)}
                    style={[
                      styles.timeButton,
                      notificationTime === option.value && styles.timeButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeButtonText,
                        notificationTime === option.value && styles.timeButtonTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Card>
          )}

          <Card style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.infoText}>
              Daily reminders help you build a consistent affirmation practice.
              You can change or disable notifications anytime.
            </Text>
          </Card>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '600' },
  placeholder: { width: 40 },
  content: { padding: 20, gap: 16 },
  toggleCard: {},
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  toggleSubtitle: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  timeCard: { gap: 16 },
  sectionLabel: { color: '#CBD5F5', fontSize: 14, fontWeight: '600' },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(71, 85, 105, 0.3)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  timeButtonActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderColor: '#A855F7',
  },
  timeButtonText: { color: '#94A3B8', fontSize: 14 },
  timeButtonTextActive: { color: '#fff', fontWeight: '600' },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  infoText: { flex: 1, color: '#94A3B8', fontSize: 14, lineHeight: 20 },
});
