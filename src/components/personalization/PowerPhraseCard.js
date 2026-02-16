import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const PowerPhraseCard = ({ text, count, colors = ['#C17666', '#E8A090'] }) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Ionicons name="sparkles" size={18} color="#C17666" />
      <Text style={styles.headerText}>Your Power Phrase</Text>
    </View>
    <Text style={styles.quote}>"{text}"</Text>
    <Text style={styles.count}>You've spoken this {count} times</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#C17666',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerText: { color: '#C17666', fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
  quote: { color: '#2D2A26', fontSize: 18, fontStyle: 'italic', lineHeight: 26, textAlign: 'center' },
  count: { color: '#7A756E', fontSize: 13, textAlign: 'center' },
});
