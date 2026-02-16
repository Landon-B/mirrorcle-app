import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { AffirmationHighlightText } from '../components/affirmation';
import { useSpeechMatcher } from '../hooks/useSpeechMatcher';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useHaptics } from '../hooks/useHaptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context/AppContext';
import { typography } from '../styles/typography';
import { STORAGE_KEYS } from '../constants';

const GUIDED_AFFIRMATION = 'I am worthy of love and kindness';

const INHALE_DURATION = 4000;
const HOLD_DURATION = 2000;
const EXHALE_DURATION = 4000;
const BREATH_CYCLE = INHALE_DURATION + HOLD_DURATION + EXHALE_DURATION;
const GAZE_DURATION = 5000;
const CELEBRATION_DURATION = 3000;

const PHASE_LABELS = {
  inhale: 'Breathe in...',
  hold: 'Hold...',
  exhale: 'Breathe out...',
};

// Phases: breathing → gaze → affirmation → celebration
const PHASES = {
  BREATHING: 'breathing',
  GAZE: 'gaze',
  AFFIRMATION: 'affirmation',
  CELEBRATION: 'celebration',
};

export const GuidedFirstSessionScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [phase, setPhase] = useState(PHASES.BREATHING);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const { breathingPulse, successPulse, celebrationBurst } = useHaptics();
  const { completeOnboarding } = useApp();
  const isMountedRef = useRef(true);
  const sessionStartRef = useRef(Date.now());

  // Breathing animation
  const circleScale = useSharedValue(0.6);
  const circleOpacity = useSharedValue(0.4);

  // Text animations
  const guidanceOpacity = useSharedValue(1);
  const gazeOpacity = useSharedValue(0);
  const celebrationOpacity = useSharedValue(0);

  // Speech recognition for the affirmation phase
  const { displayTokens, activeToken, isComplete, updateWithSpeech } = useSpeechMatcher(
    phase === PHASES.AFFIRMATION ? GUIDED_AFFIRMATION : ''
  );

  const {
    isListening,
    partial,
    finalText,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  // Keep refs for speech values
  const partialRef = useRef('');
  const finalTextRef = useRef('');

  useEffect(() => { partialRef.current = partial; }, [partial]);
  useEffect(() => { finalTextRef.current = finalText; }, [finalText]);

  // Feed speech to matcher
  useEffect(() => {
    if (phase === PHASES.AFFIRMATION && (partial || finalText)) {
      updateWithSpeech(partial, finalText);
    }
  }, [partial, finalText, phase, updateWithSpeech]);

  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  // Request camera permission on mount and start
  useEffect(() => {
    const setup = async () => {
      try {
        const status = permission?.status;
        if (status !== 'granted') {
          const result = await requestPermission();
          setCameraEnabled(result.granted);
        } else {
          setCameraEnabled(true);
        }
      } catch {
        setCameraEnabled(false);
      }
    };
    setup();
  }, []);

  // Run breathing phase (2 breaths, shorter than normal)
  useEffect(() => {
    if (phase !== PHASES.BREATHING) return;

    let cancelled = false;
    let breathCount = 0;
    const totalBreaths = 2;

    const runCycle = () => {
      if (cancelled) return;

      // Inhale
      setBreathPhase('inhale');
      breathingPulse();
      circleScale.value = withTiming(1.0, { duration: INHALE_DURATION, easing: Easing.inOut(Easing.ease) });
      circleOpacity.value = withTiming(0.8, { duration: INHALE_DURATION, easing: Easing.inOut(Easing.ease) });

      // Hold
      setTimeout(() => {
        if (cancelled) return;
        setBreathPhase('hold');
      }, INHALE_DURATION);

      // Exhale
      setTimeout(() => {
        if (cancelled) return;
        setBreathPhase('exhale');
        circleScale.value = withTiming(0.6, { duration: EXHALE_DURATION, easing: Easing.inOut(Easing.ease) });
        circleOpacity.value = withTiming(0.4, { duration: EXHALE_DURATION, easing: Easing.inOut(Easing.ease) });
      }, INHALE_DURATION + HOLD_DURATION);

      // Next cycle or move to gaze
      setTimeout(() => {
        if (cancelled) return;
        breathCount++;
        if (breathCount < totalBreaths) {
          runCycle();
        } else {
          // Transition to gaze phase
          guidanceOpacity.value = withTiming(0, { duration: 500 });
          setTimeout(() => {
            if (cancelled || !isMountedRef.current) return;
            setPhase(PHASES.GAZE);
          }, 600);
        }
      }, BREATH_CYCLE);
    };

    const startTimer = setTimeout(runCycle, 500);
    return () => { cancelled = true; clearTimeout(startTimer); };
  }, [phase]);

  // Gaze phase: "Look into your own eyes" for 5s then transition to affirmation
  useEffect(() => {
    if (phase !== PHASES.GAZE) return;

    gazeOpacity.value = withTiming(1, { duration: 800 });

    const timer = setTimeout(() => {
      if (!isMountedRef.current) return;
      gazeOpacity.value = withTiming(0, { duration: 600 });
      setTimeout(() => {
        if (isMountedRef.current) setPhase(PHASES.AFFIRMATION);
      }, 700);
    }, GAZE_DURATION);

    return () => clearTimeout(timer);
  }, [phase]);

  // Start listening when affirmation phase begins
  useEffect(() => {
    if (phase !== PHASES.AFFIRMATION) return;
    if (!isSpeechSupported) return;

    const timer = setTimeout(async () => {
      try { await startListening({ language: 'en-US' }); } catch {}
    }, 500);

    return () => clearTimeout(timer);
  }, [phase, isSpeechSupported]);

  // Handle affirmation completion
  useEffect(() => {
    if (phase !== PHASES.AFFIRMATION || !isComplete) return;

    successPulse();

    // Stop listening
    if (isListening) {
      stopListening().catch(() => {});
    }

    // Brief pause then celebration
    const timer = setTimeout(() => {
      if (!isMountedRef.current) return;
      celebrationBurst();
      celebrationOpacity.value = withTiming(1, { duration: 600 });
      setPhase(PHASES.CELEBRATION);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isComplete, phase]);

  // Celebration phase: navigate after delay
  useEffect(() => {
    if (phase !== PHASES.CELEBRATION) return;

    const timer = setTimeout(async () => {
      if (!isMountedRef.current) return;

      // Cache the first session data for retroactive save after account creation
      const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);
      const pendingSession = {
        durationSeconds,
        promptsCompleted: 1,
        affirmationText: GUIDED_AFFIRMATION,
        completedAt: new Date().toISOString(),
      };
      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.pendingFirstSession,
          JSON.stringify(pendingSession)
        );
      } catch (e) {
        // Non-critical — session save is best-effort
      }

      await completeOnboarding();
      navigation.replace('GuidedFirstCelebration');
    }, CELEBRATION_DURATION);

    return () => clearTimeout(timer);
  }, [phase]);

  const circleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: circleOpacity.value,
  }));

  const guidanceAnimatedStyle = useAnimatedStyle(() => ({
    opacity: guidanceOpacity.value,
  }));

  const gazeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: gazeOpacity.value,
  }));

  const celebrationAnimatedStyle = useAnimatedStyle(() => ({
    opacity: celebrationOpacity.value,
  }));

  // Breathing phase UI
  if (phase === PHASES.BREATHING) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.breathingContent}>
          <Animated.View style={[styles.breathingCircle, circleAnimatedStyle]}>
            <View style={styles.breathingCircleInner}>
              <Text style={styles.breathingPhaseLabel}>{PHASE_LABELS[breathPhase]}</Text>
            </View>
          </Animated.View>

          <Animated.View style={guidanceAnimatedStyle}>
            <Text style={styles.guidanceText}>Take a deep breath.</Text>
            <Text style={styles.guidanceSubtext}>This moment is yours.</Text>
          </Animated.View>
        </View>
      </View>
    );
  }

  // Camera phases (gaze, affirmation, celebration)
  return (
    <View style={styles.darkContainer}>
      <StatusBar barStyle="light-content" />

      {/* Camera */}
      <View style={styles.cameraFull}>
        {cameraEnabled && (
          <CameraView style={StyleSheet.absoluteFill} facing="front" />
        )}

        {/* Warm vignette */}
        <LinearGradient
          colors={['rgba(193, 118, 102, 0.25)', 'transparent']}
          style={styles.vignetteTop}
        />
        <LinearGradient
          colors={['transparent', 'rgba(193, 118, 102, 0.2)']}
          style={styles.vignetteBottom}
        />
        <LinearGradient
          colors={['rgba(193, 118, 102, 0.15)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0.3, y: 0.5 }}
          style={styles.vignetteSide}
        />
        <LinearGradient
          colors={['transparent', 'rgba(193, 118, 102, 0.15)']}
          start={{ x: 0.7, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.vignetteSide}
        />

        {/* Gaze prompt overlay */}
        {phase === PHASES.GAZE && (
          <View style={styles.overlay}>
            <Animated.View style={[styles.gazeContainer, gazeAnimatedStyle]}>
              <Text style={styles.gazeText}>Look into your own eyes.</Text>
            </Animated.View>
          </View>
        )}

        {/* Affirmation overlay */}
        {phase === PHASES.AFFIRMATION && (
          <View style={styles.overlay}>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.promptGradient}
            >
              <Animated.Text
                entering={FadeIn.duration(400)}
                style={styles.speakPrompt}
              >
                Say these words like you mean them
              </Animated.Text>

              <AffirmationHighlightText
                tokens={displayTokens}
                activeToken={activeToken}
                style={styles.affirmationText}
                spokenStyle={styles.affirmationSpoken}
                currentStyle={styles.affirmationCurrent}
                pendingStyle={styles.affirmationPending}
                showQuotes
              />

              {isListening && (
                <Animated.View entering={FadeIn.delay(300)} style={styles.listeningRow}>
                  <Ionicons name="mic" size={14} color="#A7F3D0" />
                  <Text style={styles.listeningText}>Listening...</Text>
                </Animated.View>
              )}
            </LinearGradient>
          </View>
        )}

        {/* Celebration overlay */}
        {phase === PHASES.CELEBRATION && (
          <View style={styles.overlay}>
            <Animated.View style={[styles.celebrationContainer, celebrationAnimatedStyle]}>
              <Ionicons name="checkmark-circle" size={56} color="#34D399" />
              <Text style={styles.celebrationText}>
                You just did something{'\n'}most people never will.
              </Text>
            </Animated.View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Breathing phase (light bg)
  container: {
    flex: 1,
    backgroundColor: '#F5F2EE',
  },
  breathingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 40,
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(193, 118, 102, 0.12)',
    borderWidth: 2,
    borderColor: 'rgba(193, 118, 102, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingCircleInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(193, 118, 102, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingPhaseLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#C17666',
    textAlign: 'center',
  },
  guidanceText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2D2A26',
    textAlign: 'center',
    marginBottom: 8,
  },
  guidanceSubtext: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 17,
    fontStyle: 'italic',
    color: '#7A756E',
    textAlign: 'center',
  },

  // Camera phases (dark bg)
  darkContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraFull: {
    flex: 1,
    position: 'relative',
  },

  // Vignette overlays
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '25%',
    zIndex: 1,
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    zIndex: 1,
  },
  vignetteSide: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },

  // Shared overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Gaze
  gazeContainer: {
    paddingHorizontal: 40,
  },
  gazeText: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 26,
    fontStyle: 'italic',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // Affirmation
  promptGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 80,
    paddingTop: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
  },
  speakPrompt: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  affirmationText: {
    fontSize: 24,
    lineHeight: 34,
    textAlign: 'center',
    color: '#E2E8F0',
  },
  affirmationSpoken: {
    color: '#34D399',
  },
  affirmationCurrent: {
    color: '#E8A090',
    fontWeight: '700',
  },
  affirmationPending: {
    color: '#E2E8F0',
  },
  listeningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  listeningText: {
    fontSize: 12,
    color: '#A7F3D0',
  },

  // Celebration
  celebrationContainer: {
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 40,
  },
  celebrationText: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 22,
    fontStyle: 'italic',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 32,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
