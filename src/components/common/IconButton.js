import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const IconButton = ({ icon, size = 20, onPress, style, active, accessibilityLabel }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel || icon}
    accessibilityState={{ selected: !!active }}
    style={({ pressed }) => [
      styles.iconCircleButton,
      active && styles.iconCircleButtonActive,
      pressed && styles.buttonPressed,
      style,
    ]}
  >
    <Ionicons name={icon} size={size} color={active ? '#fff' : '#7A756E'} />
  </Pressable>
);

const styles = StyleSheet.create({
  iconCircleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0ECE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleButtonActive: {
    backgroundColor: '#C17666',
  },
  buttonPressed: { transform: [{ scale: 0.98 }] },
});
