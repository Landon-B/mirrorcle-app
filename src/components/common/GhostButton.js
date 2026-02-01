import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

export const GhostButton = ({ title, onPress, style }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.ghostButton, pressed && styles.buttonPressed, style]}
  >
    <Text style={styles.ghostButtonText}>{title}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  ghostButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#475569',
    paddingVertical: 14,
    paddingHorizontal: 18,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonText: { color: '#fff', fontSize: 16 },
  buttonPressed: { transform: [{ scale: 0.98 }] },
});
