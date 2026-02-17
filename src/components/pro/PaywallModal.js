import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton, GhostButton } from '../common';
import { useApp } from '../../context/AppContext';
import { typography } from '../../styles/typography';
import { useColors } from '../../hooks/useColors';

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
  const c = useColors();

  const messaging = FEATURE_MESSAGING[feature] || FEATURE_MESSAGING.default;

  const handlePurchase = async () => {
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
      <View style={[styles.backdrop, { backgroundColor: c.overlayHeavy }]}>
        <Pressable style={styles.backdropPress} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: c.surface }]}>
          <View style={styles.header}>
            <View style={[styles.badge, { backgroundColor: c.accentPeach }]}>
              <Ionicons name={messaging.icon} size={24} color={c.accentRust} />
            </View>
            <Text style={[styles.title, { color: c.textPrimary }]}>{messaging.title}</Text>
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>{messaging.subtitle}</Text>
          </View>

          <View style={styles.valuePoints}>
            {VALUE_POINTS.map((point, index) => (
              <View key={index} style={styles.valueRow}>
                <Ionicons name="checkmark" size={18} color={c.accentRust} />
                <Text style={[styles.valueText, { color: c.textPrimary }]}>{point}</Text>
              </View>
            ))}
          </View>

          <View style={styles.pricingRow}>
            <Text style={[styles.priceMain, { color: c.textPrimary }]}>$4.99</Text>
            <Text style={[styles.pricePeriod, { color: c.textSecondary }]}>/month</Text>
          </View>
          <Text style={[styles.trialNote, { color: c.textSecondary }]}>7 days free, then $4.99/month</Text>

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
    justifyContent: 'flex-end',
  },
  backdropPress: {
    flex: 1,
  },
  sheet: {
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fontFamily.serifItalic,
    fontStyle: 'italic',
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
    fontSize: 15,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
  },
  priceMain: {
    fontSize: 32,
    fontWeight: '700',
  },
  pricePeriod: {
    fontSize: 16,
  },
  trialNote: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: -12,
  },
  actions: {
    gap: 12,
  },
});
