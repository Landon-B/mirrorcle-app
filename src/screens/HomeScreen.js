import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated, PanResponder, Dimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground, PrimaryButton } from '../components/common';
import { AFFIRMATIONS } from '../constants';

const SWIPE_THRESHOLD = 50;

export const HomeScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const autoAdvanceRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const indexRef = useRef(currentIndex);
  const goToNextRef = useRef(null);

  // Keep ref in sync with state
  useEffect(() => {
    indexRef.current = currentIndex;
  }, [currentIndex]);

  const current = AFFIRMATIONS[currentIndex];

  // Smooth transition animation
  const animateTransition = useCallback((direction, newIndex) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: direction * -30,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentIndex(newIndex);
      slideAnim.setValue(direction * 30);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [fadeAnim, slideAnim]);

  const goToNext = useCallback(() => {
    const idx = indexRef.current;
    const nextIndex = idx < AFFIRMATIONS.length - 1 ? idx + 1 : 0;
    animateTransition(1, nextIndex);
  }, [animateTransition]);

  const goToPrev = useCallback(() => {
    const idx = indexRef.current;
    const prevIndex = idx > 0 ? idx - 1 : AFFIRMATIONS.length - 1;
    animateTransition(-1, prevIndex);
  }, [animateTransition]);

  // Keep ref updated so PanResponder always has latest function
  useEffect(() => {
    goToNextRef.current = goToNext;
  }, [goToNext]);

  const startAutoAdvance = useCallback(() => {
    if (autoAdvanceRef.current) {
      clearInterval(autoAdvanceRef.current);
    }
    autoAdvanceRef.current = setInterval(() => {
      if (goToNextRef.current) goToNextRef.current();
    }, 5000);
  }, []);

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 15,
      onPanResponderGrant: () => {
        // Pause auto-advance when user starts swiping
        if (autoAdvanceRef.current) {
          clearInterval(autoAdvanceRef.current);
          autoAdvanceRef.current = null;
        }
        if (resumeTimerRef.current) {
          clearTimeout(resumeTimerRef.current);
          resumeTimerRef.current = null;
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -SWIPE_THRESHOLD) {
          const idx = indexRef.current;
          const nextIndex = idx < AFFIRMATIONS.length - 1 ? idx + 1 : 0;
          // Use refs to access latest animation functions
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: -30,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setCurrentIndex(nextIndex);
            slideAnim.setValue(30);
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
              }),
              Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
              }),
            ]).start();
          });
        } else if (gesture.dy > SWIPE_THRESHOLD) {
          const idx = indexRef.current;
          const prevIndex = idx > 0 ? idx - 1 : AFFIRMATIONS.length - 1;
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 30,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setCurrentIndex(prevIndex);
            slideAnim.setValue(-30);
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
              }),
              Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
              }),
            ]).start();
          });
        }
        // Resume auto-advance after a delay, reusing startAutoAdvance
        resumeTimerRef.current = setTimeout(() => {
          if (autoAdvanceRef.current) {
            clearInterval(autoAdvanceRef.current);
          }
          autoAdvanceRef.current = setInterval(() => {
            if (goToNextRef.current) goToNextRef.current();
          }, 5000);
        }, 500);
      },
    })
  ).current;

  useEffect(() => {
    startAutoAdvance();
    return () => {
      if (autoAdvanceRef.current) {
        clearInterval(autoAdvanceRef.current);
      }
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
    };
  }, [startAutoAdvance]);

  if (!current) {
    return null;
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centeredContainer} {...panResponder.panHandlers}>
          <View style={styles.brandHeader}>
            <Text style={styles.brandTitle}>Mirrorcle</Text>
            <Text style={styles.brandSubtitle}>Reflect, affirm, transform</Text>
          </View>

          <Animated.View
            style={[
              styles.affirmationWrapper,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <LinearGradient colors={current.colors} style={styles.affirmationGradient}>
              <View style={styles.affirmationCard}>
                <Text style={styles.affirmationText}>
                  "{current.text}"
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>

          <View style={styles.indicators}>
            <View style={styles.dotsRow}>
              {AFFIRMATIONS.map((_, idx) => (
                <View
                  key={idx}
                  style={[styles.dot, idx === currentIndex && styles.dotActive]}
                />
              ))}
            </View>
            <Text style={styles.swipeHint}>Swipe to explore</Text>
          </View>

          <View style={styles.buttonWrapper}>
            <PrimaryButton
              title="Start Your Affirmation"
              icon="sparkles"
              onPress={() => navigation.navigate("Feelings")}
            />
          </View>

          <Pressable
            onPress={() => navigation.navigate('AffirmationHome')}
            style={styles.skipButton}
          >
            <Text style={styles.skipButtonText}>Skip Affirmation</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  brandHeader: { alignItems: 'center', marginBottom: 32 },
  brandTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: '#E9D5FF',
  },
  brandSubtitle: { color: '#CBD5F5', marginTop: 6, fontSize: 16 },
  affirmationWrapper: { width: '100%', marginBottom: 20 },
  affirmationGradient: { borderRadius: 24, padding: 2 },
  affirmationCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 22,
    paddingVertical: 40,
    paddingHorizontal: 28,
    minHeight: 140,
    justifyContent: 'center',
  },
  affirmationText: { color: '#fff', fontSize: 22, textAlign: 'center', lineHeight: 32 },
  indicators: { alignItems: 'center', marginBottom: 28 },
  dotsRow: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#475569' },
  dotActive: { width: 20, backgroundColor: '#C084FC' },
  swipeHint: { color: '#64748B', fontSize: 12, marginTop: 10 },
  buttonWrapper: { width: '100%' },
  skipButton: { marginTop: 20, paddingVertical: 8, paddingHorizontal: 16, opacity: 0.5 },
  skipButtonText: { color: '#fff', fontSize: 14 },
});
