import React from 'react';
import { View, Text, Linking, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton, GhostButton } from '../components/common';
import { useColors } from '../hooks/useColors';

export const CameraPermissionDeniedScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const c = useColors();

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: c.accentPeach }]}>
          <Ionicons name="camera-outline" size={36} color={c.accentRust} />
        </View>

        <Text style={[styles.title, { color: c.textPrimary }]}>Camera Access{'\n'}Needed</Text>
        <Text style={[styles.description, { color: c.textSecondary }]}>
          Mirrorcle uses your camera so you can see yourself while speaking
          affirmations. Your camera feed stays on your device and is never
          recorded or stored.
        </Text>

        <View style={[styles.stepsCard, { backgroundColor: c.surface }]}>
          <Text style={[styles.stepsTitle, { color: c.textMuted }]}>How to enable:</Text>
          <View style={styles.step}>
            <Text style={[styles.stepNumber, { backgroundColor: c.accentPeach, color: c.accentRust }]}>1</Text>
            <Text style={[styles.stepText, { color: c.textPrimary }]}>Open your device Settings</Text>
          </View>
          <View style={styles.step}>
            <Text style={[styles.stepNumber, { backgroundColor: c.accentPeach, color: c.accentRust }]}>2</Text>
            <Text style={[styles.stepText, { color: c.textPrimary }]}>Find Mirrorcle in the app list</Text>
          </View>
          <View style={styles.step}>
            <Text style={[styles.stepNumber, { backgroundColor: c.accentPeach, color: c.accentRust }]}>3</Text>
            <Text style={[styles.stepText, { color: c.textPrimary }]}>Toggle Camera access on</Text>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <PrimaryButton
          title="Open Settings"
          icon="settings-outline"
          onPress={handleOpenSettings}
        />
        <GhostButton
          title="Go Back"
          onPress={handleGoBack}
          style={styles.backButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  stepsCard: {
    borderRadius: 20,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  stepsTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 14,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: '700',
    overflow: 'hidden',
  },
  stepText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  backButton: {
    marginTop: 12,
  },
});
