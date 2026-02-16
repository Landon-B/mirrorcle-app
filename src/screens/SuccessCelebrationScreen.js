import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import { PrimaryButton, Card } from '../components/common';
import { typography } from '../styles/typography';
import { shadows } from '../styles/spacing';
import { useHaptics } from '../hooks/useHaptics';

const MOTIVATIONAL_QUOTES = [
  { text: 'The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.', author: 'Marcel Proust' },
  { text: 'You yourself, as much as anybody in the entire universe, deserve your love and affection.', author: 'Buddha' },
  { text: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.', author: 'Ralph Waldo Emerson' },
  { text: 'The most beautiful thing you can wear is confidence.', author: 'Blake Lively' },
  { text: 'To love oneself is the beginning of a lifelong romance.', author: 'Oscar Wilde' },
];

const formatDuration = (seconds) => {
  if (!seconds || seconds < 60) return `${seconds || 0}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
};

export const SuccessCelebrationScreen = ({ navigation, route }) => {
  const {
    completedPrompts = 0,
    duration = 0,
    feeling,
    postMood,
  } = route.params || {};

  const { stats } = useApp();
  const { celebrationBurst } = useHaptics();

  // Sparkle breathe animation
  const sparkleScale = useSharedValue(0);

  useEffect(() => {
    // Celebration haptic on mount
    celebrationBurst();

    // Entrance animation for sparkle
    sparkleScale.value = withSpring(1, {
      damping: 10,
      stiffness: 120,
      mass: 0.5,
    });

    // Start breathing pulse after entrance
    const breatheTimer = setTimeout(() => {
      sparkleScale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }, 600);

    return () => clearTimeout(breatheTimer);
  }, []);

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sparkleScale.value }],
  }));

  const quote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return MOTIVATIONAL_QUOTES[randomIndex];
  }, []);

  const handleBackToHome = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('HomeTab', { screen: 'Home' });
    } else {
      navigation.navigate('HomeTab', { screen: 'Home' });
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just completed a Mirrorcle session! ${completedPrompts} truths spoken about myself. My light is shining brighter.`,
      });
    } catch (error) {
      // User cancelled or share failed silently
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sparkle icon with entrance + breathe animation */}
        <Animated.View style={[styles.sparkleContainer, sparkleAnimatedStyle]}>
          <View style={styles.sparkleCircle}>
            <Ionicons name="sparkles" size={32} color="#C17666" />
          </View>
        </Animated.View>

        {/* Heading with staggered entrance */}
        <Animated.Text
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.heading}
        >
          Beautifully done.
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(400).duration(500)}
          style={styles.subtitle}
        >
          Your light is shining brighter.
        </Animated.Text>

        {/* Session stats card */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(600)}
          style={styles.statsCard}
        >
          <Text style={styles.statsLabel}>TODAY'S SESSION</Text>

          <Text style={styles.statsCount}>{completedPrompts}</Text>
          <Text style={styles.statsDescription}>
            truths spoken{'\n'}about yourself
          </Text>

          <View style={styles.statsDivider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={18} color="#B0AAA2" />
              <Text style={styles.statValue}>{formatDuration(duration)}</Text>
              <Text style={styles.statLabel}>duration</Text>
            </View>

            <View style={styles.statDot} />

            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={18} color="#C17666" />
              <Text style={[styles.statValue, styles.statValueAccent]}>
                {stats.currentStreak || 1}
              </Text>
              <Text style={styles.statLabel}>day streak</Text>
            </View>
          </View>
        </Animated.View>

        {/* Motivational quote */}
        <Animated.View
          entering={FadeIn.delay(1000).duration(600)}
          style={styles.quoteContainer}
        >
          <Text style={styles.quoteText}>
            {'\u201C'}{quote.text}{'\u201D'}
          </Text>
          <Text style={styles.quoteAuthor}>{'\u2014'} {quote.author}</Text>
        </Animated.View>
      </ScrollView>

      {/* Footer actions */}
      <Animated.View
        entering={FadeIn.delay(1200).duration(400)}
        style={styles.footer}
      >
        <PrimaryButton
          title="Back to Home"
          icon="arrow-forward"
          onPress={handleBackToHome}
        />

        <Pressable
          onPress={handleShare}
          style={styles.shareButton}
          accessibilityRole="button"
          accessibilityLabel="Share your progress"
        >
          <Text style={styles.shareText}>SHARE YOUR PROGRESS</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2EE',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 24,
    alignItems: 'center',
  },
  sparkleContainer: {
    marginBottom: 28,
  },
  sparkleCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8D0C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2A26',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7A756E',
    textAlign: 'center',
    marginBottom: 36,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    ...shadows.card,
  },
  statsLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#B0AAA2',
    marginBottom: 16,
  },
  statsCount: {
    fontSize: 56,
    fontWeight: '700',
    color: '#C17666',
    lineHeight: 64,
  },
  statsDescription: {
    fontSize: 15,
    color: '#7A756E',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 4,
  },
  statsDivider: {
    width: '80%',
    height: 1,
    backgroundColor: '#F0ECE7',
    marginVertical: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2A26',
    marginTop: 4,
  },
  statValueAccent: {
    color: '#C17666',
  },
  statLabel: {
    fontSize: 12,
    color: '#B0AAA2',
    marginTop: 2,
  },
  statDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D4CFC9',
  },
  quoteContainer: {
    marginTop: 32,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  quoteText: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 16,
    fontStyle: 'italic',
    color: '#7A756E',
    textAlign: 'center',
    lineHeight: 24,
  },
  quoteAuthor: {
    fontSize: 13,
    color: '#B0AAA2',
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    alignItems: 'center',
  },
  shareButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  shareText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#C17666',
  },
});
