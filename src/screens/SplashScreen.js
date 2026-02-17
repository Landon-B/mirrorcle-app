import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../styles/typography';
import { useApp } from '../context/AppContext';
import { useColors } from '../hooks/useColors';

export const SplashScreen = ({ navigation }) => {
  const { hasCompletedOnboarding } = useApp();
  const c = useColors();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace(hasCompletedOnboarding ? 'MainTabs' : 'Welcome');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation, hasCompletedOnboarding]);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar barStyle={c.statusBarStyle} />
      <SafeAreaView style={styles.safeArea}>
        <Text style={[styles.brandText, { color: c.textPrimary }]}>MIRRORCLE</Text>

        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/splash-mirror.png')}
            style={styles.mirrorImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.taglineContainer}>
          <Text style={[styles.taglineText, { color: c.textPrimary }]}>See yourself</Text>
          <Text style={[styles.taglineAccent, { color: c.textAccent }]}>clearly.</Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  brandText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 3,
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
  },
  taglineAccent: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 32,
    fontStyle: 'italic',
  },
});
