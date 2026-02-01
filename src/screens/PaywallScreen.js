import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, PrimaryButton, GhostButton, Card } from '../components/common';
import { useApp } from '../context/AppContext';

const FEATURES = [
  { icon: 'color-palette', title: 'Premium Themes', subtitle: 'Access all 6 beautiful themes' },
  { icon: 'volume-high', title: 'Audio Affirmations', subtitle: 'Listen to spoken affirmations' },
  { icon: 'cloud-upload', title: 'Cloud Sync', subtitle: 'Backup and sync across devices' },
  { icon: 'analytics', title: 'Advanced Trends', subtitle: 'Detailed analytics and insights' },
  { icon: 'infinite', title: 'Unlimited Favorites', subtitle: 'Save as many as you want' },
  { icon: 'notifications', title: 'Smart Reminders', subtitle: 'Personalized notification times' },
];

export const PaywallScreen = ({ navigation }) => {
  const { isPro, updatePreferences } = useApp();

  const handlePurchase = async () => {
    // Mock purchase - in production, integrate with RevenueCat or similar
    await updatePreferences({ isPro: true });
    navigation.goBack();
  };

  const handleRestore = async () => {
    // Mock restore - in production, integrate with RevenueCat
    console.log('Restore purchases');
  };

  if (isPro) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" />
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text style={styles.title}>Pro Member</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.proContent}>
            <LinearGradient colors={['#F59E0B', '#F97316']} style={styles.proBadge}>
              <Ionicons name="crown" size={48} color="#fff" />
            </LinearGradient>
            <Text style={styles.proTitle}>You're a Pro!</Text>
            <Text style={styles.proSubtitle}>Thank you for supporting Mirrorcle</Text>
            <PrimaryButton title="Back to App" onPress={() => navigation.goBack()} />
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.heroSection}>
            <LinearGradient colors={['#F59E0B', '#F97316']} style={styles.crownBadge}>
              <Ionicons name="crown" size={36} color="#fff" />
            </LinearGradient>
            <Text style={styles.heroTitle}>Upgrade to Pro</Text>
            <Text style={styles.heroSubtitle}>Unlock the full Mirrorcle experience</Text>
          </View>

          <View style={styles.featuresSection}>
            {FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <LinearGradient
                  colors={['#A855F7', '#EC4899']}
                  style={styles.featureIcon}
                >
                  <Ionicons name={feature.icon} size={18} color="#fff" />
                </LinearGradient>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              </View>
            ))}
          </View>

          <Card style={styles.pricingCard}>
            <View style={styles.pricingHeader}>
              <Text style={styles.pricingLabel}>Best Value</Text>
            </View>
            <View style={styles.pricingContent}>
              <Text style={styles.priceMain}>$4.99</Text>
              <Text style={styles.pricePeriod}>/month</Text>
            </View>
            <Text style={styles.pricingNote}>Cancel anytime</Text>
          </Card>

          <View style={styles.actions}>
            <PrimaryButton title="Start Free Trial" icon="sparkles" onPress={handlePurchase} />
            <Text style={styles.trialNote}>7-day free trial, then $4.99/month</Text>
            <GhostButton title="Restore Purchases" onPress={handleRestore} />
          </View>

          <Text style={styles.termsText}>
            By subscribing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
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
  content: { padding: 20, gap: 24 },
  heroSection: { alignItems: 'center', gap: 12 },
  crownBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '700' },
  heroSubtitle: { color: '#CBD5F5', fontSize: 16 },
  featuresSection: { gap: 12 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    padding: 12,
    borderRadius: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1 },
  featureTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  featureSubtitle: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  pricingCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: '#A855F7',
  },
  pricingHeader: {
    backgroundColor: '#A855F7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  pricingLabel: { color: '#fff', fontSize: 12, fontWeight: '600' },
  pricingContent: { flexDirection: 'row', alignItems: 'baseline' },
  priceMain: { color: '#fff', fontSize: 36, fontWeight: '700' },
  pricePeriod: { color: '#CBD5F5', fontSize: 16 },
  pricingNote: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  actions: { gap: 12, alignItems: 'center' },
  trialNote: { color: '#94A3B8', fontSize: 12 },
  termsText: { color: '#64748B', fontSize: 12, textAlign: 'center' },
  proContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
  },
  proBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proTitle: { color: '#fff', fontSize: 28, fontWeight: '700' },
  proSubtitle: { color: '#CBD5F5', fontSize: 16, marginBottom: 20 },
});
