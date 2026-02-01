import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, StatusBar, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, PrimaryButton } from '../components/common';
import { useApp } from '../context/AppContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Welcome to Mirrorcle',
    subtitle: 'Your daily companion for self-affirmation and growth',
    icon: 'sparkles',
    colors: ['#A855F7', '#EC4899'],
  },
  {
    id: '2',
    title: 'Check In With Yourself',
    subtitle: 'Start each session by reflecting on how you feel right now',
    icon: 'heart',
    colors: ['#FB7185', '#F43F5E'],
  },
  {
    id: '3',
    title: 'Mirror Sessions',
    subtitle: 'Look yourself in the eye and speak powerful affirmations',
    icon: 'camera',
    colors: ['#3B82F6', '#06B6D4'],
  },
  {
    id: '4',
    title: 'Track Your Growth',
    subtitle: 'Watch your streak grow and celebrate your consistency',
    icon: 'trending-up',
    colors: ['#22C55E', '#10B981'],
  },
];

export const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const { completeOnboarding } = useApp();

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    navigation.replace('Home');
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
    navigation.replace('Home');
  };

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <LinearGradient colors={item.colors} style={styles.iconWrapper}>
        <Ionicons name={item.icon} size={48} color="#fff" />
      </LinearGradient>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
    </View>
  );

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          {!isLastSlide && (
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
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
                  index === currentIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.buttonContainer}>
            {isLastSlide ? (
              <PrimaryButton title="Get Started" icon="arrow-forward" onPress={handleGetStarted} />
            ) : (
              <PrimaryButton title="Next" icon="arrow-forward" onPress={handleNext} />
            )}
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
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
  skipText: { color: '#94A3B8', fontSize: 16 },
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
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideSubtitle: {
    color: '#CBD5F5',
    fontSize: 18,
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
    backgroundColor: '#475569',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#C084FC',
  },
  buttonContainer: {},
});
