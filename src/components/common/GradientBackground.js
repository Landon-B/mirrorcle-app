import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

export const GradientBackground = ({ children, colors: customColors }) => {
  const { theme } = useTheme();
  const gradientColors = customColors || theme.gradient;

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
});
