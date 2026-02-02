import React from 'react';
import { View, Text, StyleSheet, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, PrimaryButton, GhostButton } from '../components/common';

export const WelcomeScreen = ({ navigation }) => {
  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.container}>
          <View style={styles.heroSection}>
            <LinearGradient
              colors={['#A855F7', '#EC4899']}
              style={styles.iconContainer}
            >
              <Ionicons name="sparkles" size={48} color="#fff" />
            </LinearGradient>

            <Text style={styles.title}>Mirrorcle</Text>
            <Text style={styles.tagline}>Reflect, affirm, transform</Text>

            <View style={styles.quoteCard}>
              <Text style={styles.quoteText}>
                "The most powerful relationship you will ever have is the relationship with yourself."
              </Text>
              <Text style={styles.quoteAuthor}>— Steve Maraboli</Text>
            </View>
          </View>

          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <LinearGradient colors={['#3B82F6', '#06B6D4']} style={styles.featureIcon}>
                <Ionicons name="mic" size={20} color="#fff" />
              </LinearGradient>
              <Text style={styles.featureText}>Speak</Text>
            </View>
            <View style={styles.featureItem}>
              <LinearGradient colors={['#22C55E', '#10B981']} style={styles.featureIcon}>
                <Ionicons name="eye" size={20} color="#fff" />
              </LinearGradient>
              <Text style={styles.featureText}>Reflect</Text>
            </View>
            <View style={styles.featureItem}>
              <LinearGradient colors={['#F97316', '#FACC15']} style={styles.featureIcon}>
                <Ionicons name="trending-up" size={20} color="#fff" />
              </LinearGradient>
              <Text style={styles.featureText}>Grow</Text>
            </View>
          </View>

          <View style={styles.buttonSection}>
            <PrimaryButton
              title="Get Started"
              icon="arrow-forward"
              onPress={() => navigation.navigate('CreateAccount')}
            />
            <GhostButton
              title="I already have an account"
              onPress={() => navigation.navigate('Login')}
            />
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 52,
    fontWeight: '700',
    color: '#E9D5FF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#CBD5F5',
    marginBottom: 32,
  },
  quoteCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 20,
    padding: 24,
    marginTop: 8,
  },
  quoteText: {
    color: '#fff',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  quoteAuthor: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginVertical: 32,
  },
  featureItem: {
    alignItems: 'center',
    gap: 8,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    color: '#CBD5F5',
    fontSize: 14,
  },
  buttonSection: {
    gap: 12,
    marginBottom: 20,
  },
});
