import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton, GhostButton } from '../components/common';
import { useApp } from '../context/AppContext';
import { typography } from '../styles/typography';
import { shadows } from '../styles/spacing';

const VALUE_CARDS = [
  {
    icon: 'create-outline',
    title: 'Speak YOUR truth',
    description: 'Unlimited custom affirmations in your own words',
  },
  {
    icon: 'trending-up-outline',
    title: 'See your transformation',
    description: 'Deep mood patterns and monthly reflections',
  },
  {
    icon: 'color-palette-outline',
    title: 'Deeper sanctuaries',
    description: 'Premium themes that match your journey',
  },
  {
    icon: 'leaf-outline',
    title: 'Guided intentions',
    description: 'Breathing exercises and focused entry',
  },
];

export const PaywallScreen = ({ navigation }) => {
  const { isPro, updatePreferences } = useApp();

  const handlePurchase = async () => {
    // Mock purchase — in production, integrate with RevenueCat or similar
    await updatePreferences({ isPro: true });
    navigation.goBack();
  };

  const handleRestore = async () => {
    // Mock restore — in production, integrate with RevenueCat
    console.log('Restore purchases');
  };

  if (isPro) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}>
              <Ionicons name="chevron-back" size={20} color="#7A756E" />
            </Pressable>
          </View>

          <View style={styles.proContent}>
            <View style={styles.proBadge}>
              <Ionicons name="heart" size={40} color="#C17666" />
            </View>
            <Text style={styles.proTitle}>You're a Pro</Text>
            <Text style={styles.proSubtitle}>
              Thank you for deepening your practice with Mirrorcle
            </Text>
            <PrimaryButton title="Back to App" onPress={() => navigation.goBack()} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#7A756E" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.heroSection}>
            <View style={styles.heroBadge}>
              <Ionicons name="scan-outline" size={32} color="#C17666" />
            </View>
            <Text style={styles.heroTitle}>Deepen Your Practice</Text>
            <Text style={styles.heroSubtitle}>
              Your mirror has more to show you.
            </Text>
          </View>

          {/* Value Cards */}
          <View style={styles.valueSection}>
            {VALUE_CARDS.map((card, index) => (
              <View key={index} style={styles.valueCard}>
                <LinearGradient
                  colors={['#C17666', '#E8A090']}
                  style={styles.valueIcon}
                >
                  <Ionicons name={card.icon} size={18} color="#fff" />
                </LinearGradient>
                <View style={styles.valueTextContainer}>
                  <Text style={styles.valueTitle}>{card.title}</Text>
                  <Text style={styles.valueDescription}>{card.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Social Proof */}
          <View style={styles.socialProof}>
            <Text style={styles.socialQuote}>
              "I finally heard my own voice."
            </Text>
            <Text style={styles.socialAttribution}>— Early tester</Text>
          </View>

          {/* Pricing */}
          <View style={styles.pricingSection}>
            <Text style={styles.priceText}>
              Less than a coffee a week
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceMain}>$4.99</Text>
              <Text style={styles.pricePeriod}>/month</Text>
            </View>
          </View>

          {/* CTA */}
          <View style={styles.actions}>
            <PrimaryButton
              title="Begin Your Deeper Practice"
              icon="sparkles"
              onPress={handlePurchase}
            />
            <Text style={styles.trialNote}>7 days free, then $4.99/month</Text>
            <GhostButton title="Restore Purchases" onPress={handleRestore} />
          </View>

          <Text style={styles.termsText}>
            By subscribing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2EE',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0ECE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  heroBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8D0C6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2A26',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 17,
    fontStyle: 'italic',
    color: '#7A756E',
    textAlign: 'center',
  },

  // Value Cards
  valueSection: {
    gap: 12,
    marginBottom: 28,
  },
  valueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    ...shadows.card,
  },
  valueIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueTextContainer: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D2A26',
    marginBottom: 2,
  },
  valueDescription: {
    fontSize: 13,
    color: '#7A756E',
    lineHeight: 18,
  },

  // Social Proof
  socialProof: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  socialQuote: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 18,
    fontStyle: 'italic',
    color: '#2D2A26',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 6,
  },
  socialAttribution: {
    fontSize: 13,
    color: '#B0AAA2',
  },

  // Pricing
  pricingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  priceText: {
    fontSize: 14,
    color: '#7A756E',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceMain: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2D2A26',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#7A756E',
    marginLeft: 2,
  },

  // Actions
  actions: {
    gap: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  trialNote: {
    fontSize: 13,
    color: '#7A756E',
  },
  termsText: {
    fontSize: 12,
    color: '#B0AAA2',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Pro state
  proContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
  },
  proBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E8D0C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2A26',
  },
  proSubtitle: {
    fontSize: 16,
    color: '#7A756E',
    textAlign: 'center',
    marginBottom: 20,
  },
});
