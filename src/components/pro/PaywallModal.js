import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton, GhostButton, Card } from '../common';
import { useApp } from '../../context/AppContext';

const FEATURES = [
  { icon: 'color-palette', title: 'Premium Themes' },
  { icon: 'volume-high', title: 'Audio Affirmations' },
  { icon: 'cloud-upload', title: 'Cloud Sync' },
  { icon: 'analytics', title: 'Advanced Analytics' },
];

export const PaywallModal = ({ visible, onClose, feature }) => {
  const { updatePreferences } = useApp();

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
            <LinearGradient colors={['#F59E0B', '#F97316']} style={styles.badge}>
              <Ionicons name="crown" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.title}>Unlock {feature || 'Pro Features'}</Text>
            <Text style={styles.subtitle}>Upgrade to access all premium features</Text>
          </View>

          <View style={styles.features}>
            {FEATURES.map((item, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons name={item.icon} size={20} color="#A855F7" />
                <Text style={styles.featureText}>{item.title}</Text>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              </View>
            ))}
          </View>

          <Card style={styles.priceCard}>
            <Text style={styles.priceMain}>$4.99</Text>
            <Text style={styles.pricePeriod}>/month</Text>
          </Card>

          <View style={styles.actions}>
            <PrimaryButton title="Start Free Trial" onPress={handlePurchase} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  backdropPress: { flex: 1 },
  sheet: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 20,
  },
  header: { alignItems: 'center', gap: 8 },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#94A3B8', fontSize: 14 },
  features: { gap: 12 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  featureText: { flex: 1, color: '#fff', fontSize: 16 },
  priceCard: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
  },
  priceMain: { color: '#fff', fontSize: 32, fontWeight: '700' },
  pricePeriod: { color: '#94A3B8', fontSize: 16 },
  actions: { gap: 12 },
});
