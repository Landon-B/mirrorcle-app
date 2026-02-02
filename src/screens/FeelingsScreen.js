import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GradientBackground, PrimaryButton, GhostButton } from '../components/common';
import { FEELINGS } from '../constants';
import { storageService } from '../services/storage';

export const FeelingsScreen = ({ navigation }) => {
  const [selected, setSelected] = useState(null);

  const handleContinue = async () => {
    if (!selected) return;
    await storageService.setCurrentFeeling(selected);
    navigation.navigate('Session');
  };

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
            {FEELINGS.map((feeling) => (
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
  rowButtons: { flexDirection: 'row', gap: 12, marginTop: 20, width: '100%' },
  flexButton: { flex: 1 },
  buttonPressed: { transform: [{ scale: 0.98 }] },
});
