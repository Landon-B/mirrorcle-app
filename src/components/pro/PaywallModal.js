import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton, GhostButton } from '../common';
import { useApp } from '../../context/AppContext';
import { typography } from '../../styles/typography';

const FEATURE_MESSAGING = {
  custom_affirmations: {
    title: 'Speak Your Own Truth',
    subtitle: 'Unlimited custom affirmations to express what you truly need to hear.',
    icon: 'create-outline',
  },
  advanced_trends: {
    title: 'See Your Transformation',
    subtitle: 'Deep mood analytics that reveal how far you\u2019ve come.',
    icon: 'trending-up-outline',
  },
  premium_themes: {
    title: 'Find Your Sanctuary',
    subtitle: 'Immersive themes that deepen your practice.',
    icon: 'color-palette-outline',
  },
  monthly_reflection: {
    title: 'Your Monthly Story',
    subtitle: 'Beautiful summaries of your growth journey.',
    icon: 'analytics-outline',
  },
  mood_analytics: {
    title: 'Understand Your Patterns',
    subtitle: 'See how your emotions shift and grow over time.',
    icon: 'pulse-outline',
  },
  default: {
    title: 'Deepen Your Practice',
    subtitle: 'Your mirror has more to show you.',
    icon: 'scan-outline',
  },
};

const VALUE_POINTS = [
  'Unlimited custom affirmations',
  'Deep mood patterns & reflections',
  'Premium themes & guided breathing',
];

export const PaywallModal = ({ visible, onClose, feature }) => {
  const { updatePreferences } = useApp();

  const messaging = FEATURE_MESSAGING[feature] || FEATURE_MESSAGING.default;

  const handlePurchase = async () => {
    // Mock purchase
    await updatePreferences({ isPro: true });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPress} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.badge}>
              <Ionicons name={messaging.icon} size={24} color="#C17666" />
            </View>
            <Text style={styles.title}>{messaging.title}</Text>
            <Text style={styles.subtitle}>{messaging.subtitle}</Text>
          </View>

          <View style={styles.valuePoints}>
            {VALUE_POINTS.map((point, index) => (
              <View key={index} style={styles.valueRow}>
                <Ionicons name="checkmark" size={18} color="#C17666" />
                <Text style={styles.valueText}>{point}</Text>
              </View>
            ))}
          </View>

          <View style={styles.pricingRow}>
            <Text style={styles.priceMain}>$4.99</Text>
            <Text style={styles.pricePeriod}>/month</Text>
          </View>
          <Text style={styles.trialNote}>7 days free, then $4.99/month</Text>

          <View style={styles.actions}>
            <PrimaryButton title="Begin Your Deeper Practice" onPress={handlePurchase} />
            <GhostButton title="Maybe Later" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropPress: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 20,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8D0C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#2D2A26',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fontFamily.serifItalic,
    fontStyle: 'italic',
    color: '#7A756E',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  valuePoints: {
    gap: 10,
    paddingHorizontal: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  valueText: {
    flex: 1,
    color: '#2D2A26',
    fontSize: 15,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
  },
  priceMain: {
    color: '#2D2A26',
    fontSize: 32,
    fontWeight: '700',
  },
  pricePeriod: {
    color: '#7A756E',
    fontSize: 16,
  },
  trialNote: {
    fontSize: 13,
    color: '#7A756E',
    textAlign: 'center',
    marginTop: -12,
  },
  actions: {
    gap: 12,
  },
});
