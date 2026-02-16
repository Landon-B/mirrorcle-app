import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const MilestoneCard = ({ title, description, onDismiss }) => (
  <View style={styles.card}>
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons name="trophy" size={22} color="#F59E0B" />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {onDismiss && (
        <Pressable onPress={onDismiss} style={styles.dismissButton}>
          <Ionicons name="close" size={18} color="#B0AAA2" />
        </Pressable>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#C17666',
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
    backgroundColor: 'rgba(193, 118, 102, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  title: { color: '#2D2A26', fontSize: 15, fontWeight: '600' },
  description: { color: '#7A756E', fontSize: 12, marginTop: 2 },
  dismissButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0ECE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
