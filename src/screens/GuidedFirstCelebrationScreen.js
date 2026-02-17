import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import { PrimaryButton } from '../components/common';
import { typography } from '../styles/typography';
import { useHaptics } from '../hooks/useHaptics';
import { useColors } from '../hooks/useColors';

export const GuidedFirstCelebrationScreen = ({ navigation }) => {
  const { celebrationBurst } = useHaptics();
  const c = useColors();

  const sparkleScale = useSharedValue(0);

  useEffect(() => {
    celebrationBurst();

    // Entrance spring
    sparkleScale.value = withSpring(1, {
      damping: 10,
      stiffness: 120,
      mass: 0.5,
    });

    // Breathing pulse after entrance
    const timer = setTimeout(() => {
      sparkleScale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sparkleScale.value }],
  }));

  const handleContinue = () => {
    navigation.replace('SaveJourney');
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.sparkleCircle, { backgroundColor: c.accentPeach }, sparkleAnimatedStyle]}>
          <Ionicons name="sparkles" size={36} color={c.accentRust} />
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(300).duration(500)}
          style={[styles.heading, { color: c.textPrimary }]}
        >
          You just did something{'\n'}most people never will.
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(500).duration(500)}
          style={[styles.subtitle, { color: c.textSecondary }]}
        >
          That courage? It's already changing you.
        </Animated.Text>
      </View>

      <Animated.View
        entering={FadeIn.delay(1000).duration(400)}
        style={styles.footer}
      >
        <PrimaryButton
          title="Let's Continue"
          icon="arrow-forward"
          onPress={handleContinue}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  sparkleCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 17,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
});
