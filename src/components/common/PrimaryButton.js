import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export const PrimaryButton = ({ title, icon, onPress, disabled, style, accessibilityLabel }) => {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.primaryButtonDisabled,
        pressed && !disabled && styles.buttonPressed,
        style,
      ]}
    >
      <LinearGradient
        colors={disabled ? ['#475569', '#475569'] : theme.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.primaryButtonGradient}
      >
        {icon && <Ionicons name={icon} size={20} color="#fff" style={styles.buttonIcon} />}
        <Text style={styles.primaryButtonText}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  primaryButton: {},
  primaryButtonGradient: {
    borderRadius: 999,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  buttonIcon: { marginRight: 8 },
  primaryButtonDisabled: { opacity: 0.7 },
  buttonPressed: { transform: [{ scale: 0.98 }] },
});
