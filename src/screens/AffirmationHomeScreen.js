import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Pressable, Share, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { PrimaryButton, OverlaySheet, IconButton } from '../components/common';
import { AFFIRMATIONS } from '../constants';
import { affirmationService } from '../services/affirmations';
import { focusService } from '../services/focus';
import { useFavorites } from '../hooks/useFavorites';
import { useApp } from '../context/AppContext';
import { getCardColors } from '../constants/cardPalette';
import { typography } from '../styles/typography';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Animation constants
const SNAP_THRESHOLD = 100;
const CARD_EXIT_DISTANCE = SCREEN_HEIGHT * 0.6;
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.5,
};

export const AffirmationHomeScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [affirmations, setAffirmations] = useState(AFFIRMATIONS); // Fallback to local
  const [isLoading, setIsLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isPro, preferences, updatePreferences } = useApp();

  // Shared values for gesture-driven animations
  const translateY = useSharedValue(0);
  const cardScale = useSharedValue(1);

  useEffect(() => {
    loadAffirmations();
  }, [isPro]);

  const loadAffirmations = async () => {
    try {
      const supabaseAffirmations = await affirmationService.getAll({
        isPrompt: false, // Get display affirmations, not prompts
        isPro,
        shuffle: true, // Randomize the order each time
      });
      if (supabaseAffirmations && supabaseAffirmations.length > 0) {
        setAffirmations(supabaseAffirmations);
      }
    } catch (error) {
      console.log('Using local affirmations:', error.message);
      // Keep using local AFFIRMATIONS constant as fallback
    } finally {
      setIsLoading(false);
    }
  };

  const current = affirmations[currentIndex];
  const isLiked = current ? isFavorite(current.id) : false;

  // Swap card and animate in from the given direction
  const swapCard = (direction) => {
    // direction: 1 = next (entering from below), -1 = prev (entering from above)
    setCurrentIndex((prev) =>
      direction === 1
        ? (prev + 1) % affirmations.length
        : (prev - 1 + affirmations.length) % affirmations.length
    );
    // Set entry position (opposite of swipe direction)
    translateY.value = direction * 120;
    cardScale.value = 0.95;
    // Animate to center
    translateY.value = withSpring(0, SPRING_CONFIG);
    cardScale.value = withSpring(1, SPRING_CONFIG);
  };

  // Pan gesture for swiping cards
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = event.translationY;
      // Scale down slightly as card moves away from center
      const progress = Math.abs(event.translationY) / CARD_EXIT_DISTANCE;
      cardScale.value = interpolate(progress, [0, 1], [1, 0.9], Extrapolation.CLAMP);
    })
    .onEnd((event) => {
      const shouldSnapNext = event.translationY < -SNAP_THRESHOLD;
      const shouldSnapPrev = event.translationY > SNAP_THRESHOLD;

      if (shouldSnapNext) {
        runOnJS(swapCard)(1);
      } else if (shouldSnapPrev) {
        runOnJS(swapCard)(-1);
      } else {
        // Snap back to center
        translateY.value = withSpring(0, SPRING_CONFIG);
        cardScale.value = withSpring(1, SPRING_CONFIG);
      }
    });

  // Animated style for the card
  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: cardScale.value },
    ],
    opacity: interpolate(
      Math.abs(translateY.value),
      [0, CARD_EXIT_DISTANCE],
      [1, 0.5],
      Extrapolation.CLAMP
    ),
  }));

  const handleToggleLike = () => {
    if (current) {
      toggleFavorite(current.id);
    }
  };

  const handleShare = async () => {
    if (!current) return;
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
      colors: ['#C17666', '#E8A090'],
      onPress: () => {
        setShowProfile(false);
        navigation.getParent()?.navigate('ProfileTab', { screen: 'Themes' });
      },
    },
    {
      icon: 'heart',
      label: 'Favorites',
      subtitle: 'Your saved affirmations',
      colors: ['#FB7185', '#F43F5E'],
      onPress: () => {
        setShowProfile(false);
        navigation.getParent()?.navigate('ProfileTab', { screen: 'Favorites' });
      },
    },
    {
      icon: 'trending-up',
      label: 'Trends',
      subtitle: 'Track your progress',
      colors: ['#22C55E', '#10B981'],
      onPress: () => {
        setShowProfile(false);
        navigation.getParent()?.navigate('GrowthTab', { screen: 'GrowthDashboard' });
      },
    },
    {
      icon: 'create',
      label: 'My Affirmations',
      subtitle: 'Create your own affirmations',
      colors: ['#F59E0B', '#F97316'],
      onPress: () => {
        setShowProfile(false);
        navigation.getParent()?.navigate('ProfileTab', { screen: 'CustomAffirmations' });
      },
    },
  ];

  const sessionLengthOptions = [3, 5, 7];
  const cycleSessionLength = () => {
    const current = preferences.preferredSessionLength || 3;
    const idx = sessionLengthOptions.indexOf(current);
    const next = sessionLengthOptions[(idx + 1) % sessionLengthOptions.length];
    updatePreferences({ preferredSessionLength: next });
  };

  const toggleRepeatAffirmations = () => {
    updatePreferences({ repeatAffirmations: !preferences.repeatAffirmations });
  };

  const settingsItems = [
    {
      icon: 'timer-outline',
      label: 'Session Length',
      subtitle: `${preferences.preferredSessionLength || 3} affirmations`,
      colors: ['#D4845A', '#C17666'],
      onPress: cycleSessionLength,
    },
    {
      icon: 'repeat',
      label: 'Repeat Affirmations',
      subtitle: preferences.repeatAffirmations ? 'On' : 'Off',
      colors: ['#22C55E', '#10B981'],
      onPress: toggleRepeatAffirmations,
    },
    {
      icon: 'diamond',
      label: 'Upgrade to Pro',
      subtitle: isPro ? 'You are a Pro member!' : 'Unlock premium features',
      colors: ['#F59E0B', '#F97316'],
      onPress: () => {
        setShowSettings(false);
        navigation.getParent()?.getParent()?.navigate('Paywall');
      },
    },
    {
      icon: 'notifications',
      label: 'Notifications',
      subtitle: 'Daily reminders',
      colors: ['#3B82F6', '#06B6D4'],
      onPress: () => {
        setShowSettings(false);
        navigation.getParent()?.navigate('ProfileTab', { screen: 'NotificationSettings' });
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C17666" />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!current) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>No affirmations available</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.topBar}>
          <IconButton icon="person" onPress={() => setShowProfile(true)} />
          <IconButton icon="settings" onPress={() => setShowSettings(true)} />
        </View>

        <View style={styles.body}>
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.cardContainer, animatedCardStyle]}>
              <LinearGradient
                colors={getCardColors(currentIndex)}
                style={styles.affirmationCardLarge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.affirmationTextLarge}>{current.text}</Text>
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
              </LinearGradient>
            </Animated.View>
          </GestureDetector>
        </View>

        <View style={styles.bottomButtonWrap}>
          <PrimaryButton
            title="Practice"
            icon="sparkles"
            onPress={async () => {
              try {
                const todaysFocus = await focusService.getTodaysFocus();
                if (todaysFocus) {
                  navigation.navigate('MoodCheckIn', {
                    mode: 'pre-session',
                    focusArea: todaysFocus,
                  });
                } else {
                  navigation.navigate('FocusSelection');
                }
              } catch (e) {
                navigation.navigate('FocusSelection');
              }
            }}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2EE' },
  safeArea: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#7A756E',
    fontSize: 16,
  },
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
  cardContainer: {
    width: '100%',
  },
  affirmationCardLarge: {
    width: '100%',
    borderRadius: 28,
    minHeight: SCREEN_HEIGHT * 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  affirmationTextLarge: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.display,
    fontSize: 26,
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: 0.3,
  },
  affirmationActions: { flexDirection: 'row', gap: 16, marginTop: 28 },
  roundAction: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundActionActive: { backgroundColor: 'rgba(255, 255, 255, 0.4)' },
  bottomButtonWrap: { paddingHorizontal: 20, paddingBottom: 18 },
});
