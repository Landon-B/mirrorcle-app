import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, StatusBar, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { PrimaryButton } from '../components/common';
import { typography } from '../styles/typography';
import { useApp } from '../context/AppContext';
import { useColors } from '../hooks/useColors';
import { useGradients } from '../hooks/useColors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Speaking to yourself in a mirror might feel strange.',
    subtitle: "That\u2019s okay. Most people have never truly paused to look at themselves.",
    icon: 'eye-outline',
  },
  {
    id: '2',
    title: 'Your voice has power.',
    subtitle: 'When you speak truth aloud, you hear it differently. It becomes real.',
    icon: 'mic-outline',
  },
  {
    id: '3',
    title: '60 seconds can change your day.',
    subtitle: "One moment of presence. One affirmation spoken with intention. That\u2019s all it takes.",
    icon: 'time-outline',
  },
  {
    id: '4',
    title: 'Ready to meet yourself?',
    subtitle: null, // Social proof handled separately
    icon: 'sparkles',
    socialProof: '"I cried the first time. Not from sadness \u2014 from finally hearing myself."',
  },
];

export const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const { completeOnboarding } = useApp();
  const c = useColors();
  const g = useGradients();

  // Build slide-specific gradient pairs from palette tokens
  const slideGradients = [
    [c.accentRust, c.feelingPink],
    [c.feelingPink, c.accentOrange],
    [c.accentOrange, c.accentRust],
    [c.accentRust, c.primaryStart],
  ];

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    navigation.replace('MainTabs');
  };

  const handleBeginFirstSession = () => {
    navigation.replace('GuidedFirstSession');
  };

  const renderSlide = ({ item, index }) => (
    <View style={styles.slide}>
      <Animated.View entering={FadeInDown.duration(500).springify().damping(12)}>
        <LinearGradient colors={slideGradients[index] || g.primary} style={styles.iconWrapper}>
          <Ionicons name={item.icon} size={48} color="#fff" />
        </LinearGradient>
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(150).duration(500)}
        style={[styles.slideTitle, { color: c.textPrimary }]}
      >
        {item.title}
      </Animated.Text>

      {item.subtitle && (
        <Animated.Text
          entering={FadeIn.delay(350).duration(500)}
          style={[styles.slideSubtitle, { color: c.textSecondary }]}
        >
          {item.subtitle}
        </Animated.Text>
      )}

      {item.socialProof && (
        <Animated.View
          entering={FadeInUp.delay(400).duration(600)}
          style={styles.socialProofContainer}
        >
          <Text style={[styles.socialProofText, { color: c.textSecondary }]}>{item.socialProof}</Text>
        </Animated.View>
      )}
    </View>
  );

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={c.statusBarStyle} />

        <View style={styles.header}>
          {!isLastSlide && (
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={[styles.skipText, { color: c.textMuted }]}>Skip</Text>
            </Pressable>
          )}
        </View>

        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setCurrentIndex(index);
          }}
          contentContainerStyle={styles.flatListContent}
        />

        <View style={styles.footer}>
          <View style={styles.dotsContainer}>
            {SLIDES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  { backgroundColor: c.border },
                  index === currentIndex && [styles.dotActive, { backgroundColor: c.accentRust }],
                ]}
              />
            ))}
          </View>

          <View style={styles.buttonContainer}>
            {isLastSlide ? (
              <PrimaryButton
                title="Begin Your First Session"
                icon="arrow-forward"
                onPress={handleBeginFirstSession}
              />
            ) : (
              <PrimaryButton title="Next" icon="arrow-forward" onPress={handleNext} />
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
    minHeight: 50,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: { fontSize: 16 },
  flatListContent: {},
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  slideSubtitle: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
  },
  socialProofContainer: {
    marginTop: 8,
    paddingHorizontal: 8,
  },
  socialProofText: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 17,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
  buttonContainer: {},
});
