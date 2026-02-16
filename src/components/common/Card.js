import React from 'react';
import { View, StyleSheet } from 'react-native';
import { shadows } from '../../styles/spacing';

export const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    ...shadows.card,
  },
});
