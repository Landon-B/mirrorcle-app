import React from 'react';
import { View, StyleSheet } from 'react-native';
import { shadows } from '../../styles/spacing';
import { useColors } from '../../hooks/useColors';

export const Card = ({ children, style }) => {
  const c = useColors();

  return (
    <View style={[styles.card, { backgroundColor: c.surface }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    ...shadows.card,
  },
});
