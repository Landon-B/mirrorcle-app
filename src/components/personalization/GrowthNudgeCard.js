import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const GrowthNudgeCard = ({ message, onDismiss }) => (
  <View style={styles.card}>
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons name="leaf" size={18} color="#34D399" />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.label}>Growth Insight</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      {onDismiss && (
        <Pressable onPress={onDismiss} style={styles.dismiss}>
          <Ionicons name="close" size={16} color="#64748B" />
        </Pressable>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  label: { color: '#34D399', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  message: { color: '#CBD5F5', fontSize: 14, lineHeight: 20 },
  dismiss: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
