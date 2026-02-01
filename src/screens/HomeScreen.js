import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground, PrimaryButton } from '../components/common';
import { AFFIRMATIONS } from '../constants';

export const HomeScreen = ({ navigation }) => {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % AFFIRMATIONS.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const current = AFFIRMATIONS[index];

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centeredContainer}>
          <View style={styles.brandHeader}>
            <Text style={styles.brandTitle}>Mirrorcle</Text>
            <Text style={styles.brandSubtitle}>Reflect, affirm, transform</Text>
          </View>

          <View style={styles.affirmationWrapper}>
            <LinearGradient colors={current.colors} style={styles.affirmationGradient}>
              <View style={styles.affirmationCard}>
                <Text style={styles.affirmationText}>
                  "{current.text}"
                </Text>
              </View>
            </LinearGradient>
          </View>

          <PrimaryButton
            title="Start Your Affirmation"
            icon="sparkles"
            onPress={() => navigation.navigate("Feelings")}
          />

          <Text style={styles.helperText}>Show up for yourself today</Text>
        </View>
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
  brandHeader: { alignItems: 'center', marginBottom: 24 },
  brandTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: '#E9D5FF',
  },
  brandSubtitle: { color: '#CBD5F5', marginTop: 6 },
  affirmationWrapper: { width: '100%', marginBottom: 28 },
  affirmationGradient: { borderRadius: 24, padding: 2 },
  affirmationCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 28,
  },
  affirmationText: { color: '#fff', fontSize: 20, textAlign: 'center', lineHeight: 28 },
  helperText: { marginTop: 20, color: '#94A3B8' },
});
