import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common/Card';

export const StatCard = ({ label, value, icon, colors, style }) => (
  <Card style={[styles.card, style]}>
    <View style={styles.row}>
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      <LinearGradient colors={colors} style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color="#fff" />
      </LinearGradient>
    </View>
  </Card>
);

const styles = StyleSheet.create({
  card: { width: '48%' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { color: '#7A756E', fontSize: 12 },
  value: { color: '#2D2A26', fontSize: 18, fontWeight: '600', marginTop: 6 },
  iconWrap: { padding: 8, borderRadius: 12 },
});
