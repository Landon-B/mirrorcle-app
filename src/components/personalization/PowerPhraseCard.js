import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export const PowerPhraseCard = ({ text, count, colors = ['#A855F7', '#EC4899'] }) => (
  <LinearGradient colors={colors} style={styles.gradientBorder}>
    <View style={styles.inner}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={18} color="#F59E0B" />
        <Text style={styles.headerText}>Your Power Phrase</Text>
      </View>
      <Text style={styles.quote}>"{text}"</Text>
      <Text style={styles.count}>You've spoken this {count} times</Text>
    </View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  gradientBorder: {
    borderRadius: 20,
    padding: 2,
  },
  inner: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 18,
    padding: 20,
    gap: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerText: { color: '#F59E0B', fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
  quote: { color: '#fff', fontSize: 18, fontStyle: 'italic', lineHeight: 26, textAlign: 'center' },
  count: { color: '#94A3B8', fontSize: 13, textAlign: 'center' },
});
