import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Switch, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, PrimaryButton, ScreenHeader } from '../components/common';
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
    permissionStatus,
    enableNotifications,
    disableNotifications,
    updateNotificationTime,
    sendTestNotification,
  } = useNotifications();

  const [sendingTest, setSendingTest] = useState(false);

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

  const handleSendTest = async () => {
    setSendingTest(true);
    try {
      // Ensure permission is granted before sending
      if (permissionStatus !== 'granted') {
        const granted = await enableNotifications(notificationTime);
        if (!granted) {
          Alert.alert('Permission Required', 'Please enable notifications in your device settings to send a test.');
          return;
        }
      }
      await sendTestNotification();
      Alert.alert('Sent!', 'Check your notifications in a moment.');
    } catch (error) {
      console.log('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification.');
    } finally {
      setSendingTest(false);
    }
  };

  const formatTime = (time) => {
    const option = TIME_OPTIONS.find(t => t.value === time);
    return option?.label || time;
  };

  return (
    <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScreenHeader title="Notifications" onBack={() => navigation.goBack()} />

        <View style={styles.content}>
          <Card style={styles.toggleCard}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Ionicons name="notifications" size={24} color="#C17666" />
                <View>
                  <Text style={styles.toggleTitle}>Daily Reminders</Text>
                  <Text style={styles.toggleSubtitle}>Get reminded to practice</Text>
                </View>
              </View>
              <Switch
                value={isEnabled}
                onValueChange={handleToggle}
                trackColor={{ false: '#E8E4DF', true: '#C17666' }}
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

          {isEnabled && (
            <Pressable
              onPress={handleSendTest}
              disabled={sendingTest}
              style={[styles.testButton, sendingTest && styles.testButtonDisabled]}
            >
              {sendingTest ? (
                <ActivityIndicator size="small" color="#C17666" />
              ) : (
                <Ionicons name="paper-plane" size={18} color="#C17666" />
              )}
              <Text style={styles.testButtonText}>
                {sendingTest ? 'Sending...' : 'Send Test Notification'}
              </Text>
            </Pressable>
          )}

          <Card style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.infoText}>
              Daily reminders help you build a consistent affirmation practice.
              You can change or disable notifications anytime.
            </Text>
          </Card>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2EE' },
  content: { padding: 20, gap: 16 },
  toggleCard: {},
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleTitle: { color: '#2D2A26', fontSize: 16, fontWeight: '600' },
  toggleSubtitle: { color: '#7A756E', fontSize: 12, marginTop: 2 },
  timeCard: { gap: 16 },
  sectionLabel: { color: '#B0AAA2', fontSize: 14, fontWeight: '600' },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F9F7F5',
    borderWidth: 1,
    borderColor: '#E8E4DF',
  },
  timeButtonActive: {
    backgroundColor: 'rgba(193, 118, 102, 0.12)',
    borderColor: '#C17666',
  },
  timeButtonText: { color: '#7A756E', fontSize: 14 },
  timeButtonTextActive: { color: '#C17666', fontWeight: '600' },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(193, 118, 102, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(193, 118, 102, 0.3)',
  },
  testButtonDisabled: { opacity: 0.6 },
  testButtonText: { color: '#C17666', fontSize: 15, fontWeight: '600' },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  infoText: { flex: 1, color: '#7A756E', fontSize: 14, lineHeight: 20 },
});
