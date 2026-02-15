import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GradientBackground, PrimaryButton, GhostButton } from '../components/common';
import { FEELINGS } from '../constants';
import { affirmationService } from '../services/affirmations';
import { storageService } from '../services/storage';
import { useApp } from '../context/AppContext';

const SESSION_LENGTH_OPTIONS = [
  { value: 3, label: 'Quick 3' },
  { value: 5, label: 'Standard 5' },
  { value: 7, label: 'Deep 7' },
];

export const FeelingsScreen = ({ navigation }) => {
  const { preferences, updatePreferences } = useApp();
  const [selected, setSelected] = useState(null);
  const [sessionLength, setSessionLength] = useState(preferences.preferredSessionLength || 3);
  const [feelings, setFeelings] = useState(FEELINGS); // Fallback to local constants
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeelings();
  }, []);

  const loadFeelings = async () => {
    try {
      const supabaseFeelings = await affirmationService.getFeelings();
      if (supabaseFeelings && supabaseFeelings.length > 0) {
        setFeelings(supabaseFeelings);
      }
    } catch (error) {
      console.log('Using local feelings data:', error.message);
      // Keep using local FEELINGS constant as fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionLengthChange = (value) => {
    setSessionLength(value);
    updatePreferences({ preferredSessionLength: value });
  };

  const handleContinue = async () => {
    if (!selected) return;
    await storageService.setCurrentFeeling(selected);
    navigation.navigate('Session');
  };

  if (isLoading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A855F7" />
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.centeredContainer}>
          <View style={styles.headerBlock}>
            <Text style={styles.sectionTitle}>How are you feeling?</Text>
            <Text style={styles.sectionSubtitle}>Choose what resonates with you right now</Text>
          </View>

          <View style={styles.feelingsGrid}>
            {feelings.map((feeling) => (
              <Pressable
                key={feeling.id}
                onPress={() => setSelected(feeling.id)}
                style={({ pressed }) => [styles.feelingCard, pressed && styles.buttonPressed]}
              >
                <LinearGradient
                  colors={selected === feeling.id ? feeling.colors : ['#1F2937', '#1F2937']}
                  style={styles.feelingCardGradient}
                >
                  <MaterialCommunityIcons
                    name={feeling.icon}
                    size={34}
                    color={selected === feeling.id ? '#fff' : '#94A3B8'}
                  />
                  <Text style={selected === feeling.id ? styles.feelingTextActive : styles.feelingText}>
                    {feeling.label}
                  </Text>
                </LinearGradient>
              </Pressable>
            ))}
          </View>

          <View style={styles.sessionLengthContainer}>
            <Text style={styles.sessionLengthLabel}>Session Length</Text>
            <View style={styles.sessionLengthPills}>
              {SESSION_LENGTH_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => handleSessionLengthChange(option.value)}
                  style={[
                    styles.sessionLengthPill,
                    sessionLength === option.value && styles.sessionLengthPillActive,
                  ]}
                >
                  <Text style={[
                    styles.sessionLengthPillText,
                    sessionLength === option.value && styles.sessionLengthPillTextActive,
                  ]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.rowButtons}>
            <GhostButton title="Back" onPress={() => navigation.goBack()} style={styles.flexButton} />
            <PrimaryButton
              title="Continue"
              onPress={handleContinue}
              disabled={!selected}
              style={styles.flexButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  headerBlock: { alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 30, fontWeight: '700', textAlign: 'center' },
  sectionSubtitle: { color: '#CBD5F5', marginTop: 8, textAlign: 'center' },
  feelingsGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  feelingCard: { width: '48%' },
  feelingCardGradient: {
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  feelingText: { color: '#CBD5F5', fontSize: 16 },
  feelingTextActive: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sessionLengthContainer: { width: '100%', marginTop: 20, alignItems: 'center' },
  sessionLengthLabel: { color: '#CBD5F5', fontSize: 14, marginBottom: 10 },
  sessionLengthPills: { flexDirection: 'row', gap: 10 },
  sessionLengthPill: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.6)',
  },
  sessionLengthPillActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
    borderColor: '#A855F7',
  },
  sessionLengthPillText: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
  sessionLengthPillTextActive: { color: '#C084FC', fontWeight: '600' },
  rowButtons: { flexDirection: 'row', gap: 12, marginTop: 20, width: '100%' },
  flexButton: { flex: 1 },
  buttonPressed: { transform: [{ scale: 0.98 }] },
});
