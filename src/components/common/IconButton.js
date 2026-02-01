import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const IconButton = ({ icon, size = 20, onPress, style, active }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.iconCircleButton,
      active && styles.iconCircleButtonActive,
      pressed && styles.buttonPressed,
      style,
    ]}
  >
    <Ionicons name={icon} size={size} color="#fff" />
  </Pressable>
);

const styles = StyleSheet.create({
  iconCircleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleButtonActive: {
    backgroundColor: '#EF4444',
  },
  buttonPressed: { transform: [{ scale: 0.98 }] },
});
