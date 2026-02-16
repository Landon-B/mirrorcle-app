import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PrimaryButton, GhostButton } from '../components/common';
import { FEELINGS } from '../constants';
import { affirmationService } from '../services/affirmations';
import { storageService } from '../services/storage';

export const FeelingsScreen = ({ navigation }) => {
  const [selected, setSelected] = useState(null);
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

  const handleContinue = async () => {
    if (!selected) return;
    await storageService.setCurrentFeeling(selected);
    navigation.navigate('Session');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C17666" />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
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
                style={({ pressed }) => [
                  styles.feelingCard,
                  selected !== feeling.id && styles.feelingCardShadow,
                  pressed && styles.buttonPressed,
                ]}
              >
                <LinearGradient
                  colors={selected === feeling.id ? feeling.colors : ['#FFFFFF', '#FFFFFF']}
                  style={styles.feelingCardGradient}
                >
                  <MaterialCommunityIcons
                    name={feeling.icon}
                    size={34}
                    color={selected === feeling.id ? '#fff' : '#B0AAA2'}
                  />
                  <Text style={selected === feeling.id ? styles.feelingTextActive : styles.feelingText}>
                    {feeling.label}
                  </Text>
                </LinearGradient>
              </Pressable>
            ))}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2EE' },
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
  sectionTitle: { color: '#2D2A26', fontSize: 30, fontWeight: '700', textAlign: 'center' },
  sectionSubtitle: { color: '#7A756E', marginTop: 8, textAlign: 'center' },
  feelingsGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  feelingCard: { width: '48%' },
  feelingCardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderRadius: 20,
  },
  feelingCardGradient: {
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  feelingText: { color: '#7A756E', fontSize: 16 },
  feelingTextActive: { color: '#fff', fontSize: 16, fontWeight: '600' },
  rowButtons: { flexDirection: 'row', gap: 12, marginTop: 20, width: '100%' },
  flexButton: { flex: 1 },
  buttonPressed: { transform: [{ scale: 0.98 }] },
});
