import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { useApp } from '../context/AppContext';

export const SplashScreen = ({ navigation }) => {
  const { hasCompletedOnboarding } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace(hasCompletedOnboarding ? 'MainTabs' : 'Welcome');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation, hasCompletedOnboarding]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.brandText}>MIRRORCLE</Text>

        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/splash-mirror.png')}
            style={styles.mirrorImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.taglineContainer}>
          <Text style={styles.taglineText}>See yourself</Text>
          <Text style={styles.taglineAccent}>clearly.</Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  brandText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 3,
    color: colors.textPrimary,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  imageContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  mirrorImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  taglineContainer: {
    alignItems: 'center',
    paddingBottom: 80,
    paddingTop: 24,
  },
  taglineText: {
    fontSize: 32,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  taglineAccent: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 32,
    fontStyle: 'italic',
    color: colors.textAccent,
  },
});
