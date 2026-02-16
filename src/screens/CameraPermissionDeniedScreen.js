import React from 'react';
import { View, Text, Linking, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton, GhostButton } from '../components/common';

export const CameraPermissionDeniedScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="camera-outline" size={36} color="#C17666" />
        </View>

        <Text style={styles.title}>Camera Access{'\n'}Needed</Text>
        <Text style={styles.description}>
          Mirrorcle uses your camera so you can see yourself while speaking
          affirmations. Your camera feed stays on your device and is never
          recorded or stored.
        </Text>

        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>How to enable:</Text>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Open your device Settings</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>Find Mirrorcle in the app list</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Toggle Camera access on</Text>
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
    backgroundColor: '#F5F2EE',
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
    backgroundColor: '#E8D0C6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2A26',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#7A756E',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  stepsCard: {
    backgroundColor: '#FFFFFF',
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
    color: '#B0AAA2',
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
    backgroundColor: '#E8D0C6',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: '700',
    color: '#C17666',
    overflow: 'hidden',
  },
  stepText: {
    fontSize: 15,
    color: '#2D2A26',
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
