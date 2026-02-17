import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Pressable, Switch, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, PrimaryButton, ScreenHeader } from '../components/common';
import { useNotifications } from '../hooks/useNotifications';
import { useColors } from '../hooks/useColors';

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

  const c = useColors();
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
    <View style={[styles.container, { backgroundColor: c.background }]}>
        <StatusBar barStyle={c.statusBarStyle} />
        <ScreenHeader title="Notifications" onBack={() => navigation.goBack()} />

        <View style={styles.content}>
          <Card style={styles.toggleCard}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Ionicons name="notifications" size={24} color={c.accentRust} />
                <View>
                  <Text style={[styles.toggleTitle, { color: c.textPrimary }]}>Daily Reminders</Text>
                  <Text style={[styles.toggleSubtitle, { color: c.textSecondary }]}>Get reminded to practice</Text>
                </View>
              </View>
              <Switch
                value={isEnabled}
                onValueChange={handleToggle}
                trackColor={{ false: c.border, true: c.accentRust }}
                thumbColor="#fff"
              />
            </View>
          </Card>

          {isEnabled && (
            <Card style={styles.timeCard}>
              <Text style={[styles.sectionLabel, { color: c.textMuted }]}>Reminder Time</Text>
              <View style={styles.timeGrid}>
                {TIME_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => handleTimeSelect(option.value)}
                    style={[
                      styles.timeButton,
                      { backgroundColor: c.surfaceSecondary, borderColor: c.border },
                      notificationTime === option.value && { backgroundColor: `${c.accentRust}1F`, borderColor: c.accentRust },
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeButtonText,
                        { color: c.textSecondary },
                        notificationTime === option.value && { color: c.accentRust, fontWeight: '600' },
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
              style={[
                styles.testButton,
                { backgroundColor: `${c.accentRust}1A`, borderColor: `${c.accentRust}4D` },
                sendingTest && styles.testButtonDisabled,
              ]}
            >
              {sendingTest ? (
                <ActivityIndicator size="small" color={c.accentRust} />
              ) : (
                <Ionicons name="paper-plane" size={18} color={c.accentRust} />
              )}
              <Text style={[styles.testButtonText, { color: c.accentRust }]}>
                {sendingTest ? 'Sending...' : 'Send Test Notification'}
              </Text>
            </Pressable>
          )}

          <Card style={[styles.infoCard, { backgroundColor: `${c.info}14`, borderColor: `${c.info}33` }]}>
            <Ionicons name="information-circle" size={20} color={c.info} />
            <Text style={[styles.infoText, { color: c.textSecondary }]}>
              Daily reminders help you build a consistent affirmation practice.
              You can change or disable notifications anytime.
            </Text>
          </Card>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 16 },
  toggleCard: {},
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleTitle: { fontSize: 16, fontWeight: '600' },
  toggleSubtitle: { fontSize: 12, marginTop: 2 },
  timeCard: { gap: 16 },
  sectionLabel: { fontSize: 14, fontWeight: '600' },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  timeButtonText: { fontSize: 14 },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  testButtonDisabled: { opacity: 0.6 },
  testButtonText: { fontSize: 15, fontWeight: '600' },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: { flex: 1, fontSize: 14, lineHeight: 20 },
});
