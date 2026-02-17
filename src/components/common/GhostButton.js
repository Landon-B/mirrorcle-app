import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useColors } from '../../hooks/useColors';

export const GhostButton = ({ title, onPress, style, accessibilityLabel }) => {
  const c = useColors();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      style={({ pressed }) => [
        styles.ghostButton,
        { borderColor: c.border },
        pressed && styles.buttonPressed,
        style,
      ]}
    >
      <Text style={[styles.ghostButtonText, { color: c.textAccent }]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  ghostButton: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonText: { fontSize: 16, fontWeight: '500' },
  buttonPressed: { transform: [{ scale: 0.98 }] },
});
