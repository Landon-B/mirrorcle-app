import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';

export const MilestoneCard = ({ title, description, onDismiss }) => {
  const c = useColors();

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderLeftColor: c.accentRust }]}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: c.accentPeach }]}>
          <Ionicons name="trophy" size={22} color={c.warning} />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: c.textPrimary }]}>{title}</Text>
          <Text style={[styles.description, { color: c.textSecondary }]}>{description}</Text>
        </View>
        {onDismiss && (
          <Pressable onPress={onDismiss} style={[styles.dismissButton, { backgroundColor: c.surfaceTertiary }]}>
            <Ionicons name="close" size={18} color={c.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    minWidth: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600' },
  description: { fontSize: 12, marginTop: 2 },
  dismissButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
