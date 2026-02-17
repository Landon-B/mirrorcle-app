import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';

export const PowerPhraseCard = ({ text, count }) => {
  const c = useColors();

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderLeftColor: c.accentRust }]}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={18} color={c.accentRust} />
        <Text style={[styles.headerText, { color: c.accentRust }]}>Your Power Phrase</Text>
      </View>
      <Text style={[styles.quote, { color: c.textPrimary }]}>"{text}"</Text>
      <Text style={[styles.count, { color: c.textSecondary }]}>You've spoken this {count} times</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerText: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
  quote: { fontSize: 18, fontStyle: 'italic', lineHeight: 26, textAlign: 'center' },
  count: { fontSize: 13, textAlign: 'center' },
});
