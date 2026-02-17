import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';

export const GrowthNudgeCard = ({ message, onDismiss }) => {
  const c = useColors();

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name="leaf" size={18} color={c.success} />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.label, { color: c.success }]}>Growth Insight</Text>
          <Text style={[styles.message, { color: c.textSecondary }]}>{message}</Text>
        </View>
        {onDismiss && (
          <Pressable onPress={onDismiss} style={styles.dismiss}>
            <Ionicons name="close" size={16} color={c.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  label: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  message: { fontSize: 14, lineHeight: 20 },
  dismiss: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
