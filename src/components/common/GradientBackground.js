import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks/useColors';

export const GradientBackground = ({ children, colors: customColors }) => {
  const c = useColors();

  if (customColors) {
    return (
      <LinearGradient colors={customColors} style={styles.container}>
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
