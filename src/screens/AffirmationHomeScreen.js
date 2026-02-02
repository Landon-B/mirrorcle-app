import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, StatusBar, Pressable, Share, Dimensions, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, PrimaryButton, OverlaySheet, IconButton } from '../components/common';
import { AFFIRMATIONS } from '../constants';
import { useFavorites } from '../hooks/useFavorites';
import { useApp } from '../context/AppContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const AffirmationHomeScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isPro } = useApp();

  const current = AFFIRMATIONS[currentIndex];
  const isLiked = isFavorite(current.id);

  const panResponder = useMemo(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 20,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -50 && currentIndex < AFFIRMATIONS.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        }
        if (gesture.dy > 50 && currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
        }
      },
    }), [currentIndex]
  );

  const handleToggleLike = () => {
    toggleFavorite(current.id);
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `"${current.text}" - From my Mirrorcle practice` });
    } catch (error) {
      // Share cancelled or failed
    }
  };

  const profileItems = [
    {
      icon: 'color-palette',
      label: 'Themes',
      subtitle: 'Customize your experience',
      colors: ['#A855F7', '#EC4899'],
      onPress: () => {
        setShowProfile(false);
        navigation.navigate('Themes');
      },
    },
    {
      icon: 'heart',
      label: 'Favorites',
      subtitle: 'Your saved affirmations',
      colors: ['#FB7185', '#F43F5E'],
      onPress: () => {
        setShowProfile(false);
        navigation.navigate('Favorites');
      },
    },
    {
      icon: 'trending-up',
      label: 'Trends',
      subtitle: 'Track your progress',
      colors: ['#22C55E', '#10B981'],
      onPress: () => {
        setShowProfile(false);
        navigation.navigate('Trends');
      },
    },
  ];

  const settingsItems = [
    {
      icon: 'diamond',
      label: 'Upgrade to Pro',
      subtitle: isPro ? 'You are a Pro member!' : 'Unlock premium features',
      colors: ['#F59E0B', '#F97316'],
      onPress: () => {
        setShowSettings(false);
        navigation.navigate('Paywall');
      },
    },
    {
      icon: 'notifications',
      label: 'Notifications',
      subtitle: 'Daily reminders',
      colors: ['#6366F1', '#A855F7'],
      onPress: () => {
        setShowSettings(false);
        navigation.navigate('NotificationSettings');
      },
    },
    {
      icon: 'share-social',
      label: 'Share with a Friend',
      subtitle: 'Spread the positivity',
      colors: ['#3B82F6', '#06B6D4'],
      onPress: () => handleShare(),
    },
  ];

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.topBar}>
          <IconButton icon="person" onPress={() => setShowProfile(true)} />
          <IconButton icon="settings" onPress={() => setShowSettings(true)} />
        </View>

        <View style={styles.body} {...panResponder.panHandlers}>
          <LinearGradient colors={current.colors} style={styles.affirmationGradientLarge}>
            <View style={styles.affirmationCardLarge}>
              <Text style={styles.affirmationTextLarge}>"{current.text}"</Text>
              <View style={styles.affirmationActions}>
                <Pressable
                  onPress={handleToggleLike}
                  style={[styles.roundAction, isLiked && styles.roundActionActive]}
                >
                  <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color="#fff" />
                </Pressable>
                <Pressable onPress={handleShare} style={styles.roundAction}>
                  <Ionicons name="share-social" size={22} color="#fff" />
                </Pressable>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.swipeIndicator}>
            <View style={styles.dotsRow}>
              {AFFIRMATIONS.map((_, idx) => (
                <View
                  key={idx}
                  style={[styles.dot, idx === currentIndex ? styles.dotActive : null]}
                />
              ))}
            </View>
            <Text style={styles.swipeText}>Swipe up or down</Text>
          </View>
        </View>

        <View style={styles.bottomButtonWrap}>
          <PrimaryButton
            title="Practice"
            icon="sparkles"
            onPress={() => navigation.navigate('Feelings')}
          />
        </View>

        <OverlaySheet
          visible={showProfile}
          title="Profile"
          subtitle="Manage your preferences"
          items={profileItems}
          onClose={() => setShowProfile(false)}
        />
        <OverlaySheet
          visible={showSettings}
          title="Settings"
          subtitle="Configure your account"
          items={settingsItems}
          onClose={() => setShowSettings(false)}
        />
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  affirmationGradientLarge: { width: '100%', borderRadius: 28, padding: 2 },
  affirmationCardLarge: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 26,
    minHeight: SCREEN_HEIGHT * 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  affirmationTextLarge: { color: '#fff', fontSize: 26, textAlign: 'center', lineHeight: 34 },
  affirmationActions: { flexDirection: 'row', gap: 16, marginTop: 28 },
  roundAction: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundActionActive: { backgroundColor: '#EF4444' },
  swipeIndicator: { alignItems: 'center', marginTop: 18 },
  dotsRow: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#475569' },
  dotActive: { width: 22, backgroundColor: '#C084FC' },
  swipeText: { color: '#94A3B8', fontSize: 12, marginTop: 6 },
  bottomButtonWrap: { paddingHorizontal: 20, paddingBottom: 18 },
});
