import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export const MilestoneCard = ({ title, description, onDismiss }) => (
  <LinearGradient colors={['#A855F7', '#EC4899']} style={styles.gradientBorder}>
    <View style={styles.inner}>
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
            <Ionicons name="close" size={18} color="#94A3B8" />
          </Pressable>
        )}
      </View>
    </View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  gradientBorder: {
    borderRadius: 20,
    padding: 2,
    minWidth: 260,
  },
  inner: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 18,
    padding: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  title: { color: '#fff', fontSize: 15, fontWeight: '600' },
  description: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  dismissButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
