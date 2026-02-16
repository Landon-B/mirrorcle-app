import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

export const GhostButton = ({ title, onPress, style, accessibilityLabel }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel || title}
    style={({ pressed }) => [styles.ghostButton, pressed && styles.buttonPressed, style]}
  >
    <Text style={styles.ghostButtonText}>{title}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  ghostButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E4DF',
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonText: { color: '#C17666', fontSize: 16, fontWeight: '500' },
  buttonPressed: { transform: [{ scale: 0.98 }] },
});
