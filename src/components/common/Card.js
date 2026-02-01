import React from 'react';
import { View, StyleSheet } from 'react-native';

export const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.6)',
  },
});
