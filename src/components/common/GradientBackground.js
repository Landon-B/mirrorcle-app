import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../styles/colors';

export const GradientBackground = ({ children, colors: customColors }) => {
  if (customColors) {
    return (
      <LinearGradient colors={customColors} style={styles.container}>
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
