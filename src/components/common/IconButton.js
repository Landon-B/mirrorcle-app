import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';

export const IconButton = ({ icon, size = 20, onPress, style, active, accessibilityLabel }) => {
  const c = useColors();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || icon}
      accessibilityState={{ selected: !!active }}
      style={({ pressed }) => [
        styles.iconCircleButton,
        { backgroundColor: active ? c.accentRust : c.surfaceTertiary },
        pressed && styles.buttonPressed,
        style,
      ]}
    >
      <Ionicons name={icon} size={size} color={active ? '#fff' : c.textSecondary} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  iconCircleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: { transform: [{ scale: 0.98 }] },
});
