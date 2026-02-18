import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator, Alert, Pressable, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import { AffirmationHighlightText } from '../components/affirmation';
import { FALLBACK_AFFIRMATIONS } from '../constants';
import { affirmationService } from '../services/affirmations';
import { sessionService } from '../services/session';
import { personalizationService } from '../services/personalization';
import { useStats } from '../hooks/useStats';
import { useSpeechMatcher } from '../hooks/useSpeechMatcher';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useApp } from '../context/AppContext';
import { usePersonalization } from '../hooks/usePersonalization';
import { storageService } from '../services/storage';
import { useHaptics } from '../hooks/useHaptics';
import { useColors } from '../hooks/useColors';
import { typography } from '../styles/typography';
import {
  GAZE_PROMPTS,
  COMPLETION_MESSAGES,
  FINAL_COMPLETION_MESSAGES,
  SPEAKING_INSTRUCTIONS,
  getDailyMessage,
} from '../constants/sessionMessages';

// Phase state machine
const PHASES = {
  BREATHING: 'breathing',
  RITUAL_OPEN: 'ritual_open',
  GAZE: 'gaze',
  INSTRUCTION: 'instruction',
  AFFIRMING: 'affirming',
  RITUAL_CLOSE: 'ritual_close',
  COMPLETE: 'complete',
};

// Breathing constants
const INHALE_DURATION = 4000;
const HOLD_DURATION = 2000;
const EXHALE_DURATION = 4000;
const BREATH_CYCLE = INHALE_DURATION + HOLD_DURATION + EXHALE_DURATION;
const TOTAL_BREATHS = 3;
const PHASE_LABELS = {
  inhale: 'Breathe in...',
  hold: 'Hold...',
  exhale: 'Breathe out...',
};

// Timing constants
const GAZE_PROMPT_DURATION = 4500;
const TRANSITION_DURATION = 2500;
const SESSION_END_DURATION = 3000;
const RITUAL_OPEN_DURATION = 3000;
const RITUAL_CLOSE_DURATION = 3000;
const INSTRUCTION_DURATION = 2100;

export const CameraSessionScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [sessionAffirmations, setSessionAffirmations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [feeling, setFeeling] = useState('');
  const [phase, setPhase] = useState(PHASES.BREATHING);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [affirmationStartTime, setAffirmationStartTime] = useState(null);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [currentBreath, setCurrentBreath] = useState(0);
  const [completionMessageIndex, setCompletionMessageIndex] = useState(0);

  const { recordSession } = useStats();
  const { isPro, user, preferences, stats } = useApp();
  const { timeOfDay } = usePersonalization();
  const { successPulse, celebrationBurst, selectionTap, breathingPulse } = useHaptics();
  const c = useColors();

  const sessionAffirmationCount = preferences.preferredSessionLength || 3;
  const totalCount = preferences.repeatAffirmations ? sessionAffirmationCount * 2 : sessionAffirmationCount;

  const currentAffirmation = sessionAffirmations[currentIndex % sessionAffirmations.length]?.text || '';
  const { displayTokens, activeToken, isComplete, updateWithSpeech } = useSpeechMatcher(currentAffirmation);

  const {
    isListening,
    partial,
    finalText,
    error: speechError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  // Refs
  const hasHandledCompletion = useRef(false);
  const ignoredPartial = useRef('');
  const ignoredFinal = useRef('');
  const isMountedRef = useRef(true);
  const partialRef = useRef('');
  const finalTextRef = useRef('');
  const completedCountRef = useRef(0);
  const sessionStartTimeRef = useRef(null);

  // Daily-seeded messages
  const gazePrompt = useRef(getDailyMessage(GAZE_PROMPTS)).current;
  const speakingInstruction = useRef(getDailyMessage(SPEAKING_INSTRUCTIONS)).current;

  // --- Animated values ---
  // Breathing
  const circleScale = useSharedValue(0.6);
  const circleOpacity = useSharedValue(0.4);
  const creamOverlayOpacity = useSharedValue(1);

  // Affirmation / progress
  const progressWidth = useSharedValue(0);
  const completionOpacity = useSharedValue(0);
  const completionScale = useSharedValue(0.5);
  const affirmationOpacity = useSharedValue(1);
  const micScale = useSharedValue(1);
  const micOpacity = useSharedValue(0.7);

  // Ritual open/close & gaze & instruction
  const ritualOpenOpacity = useSharedValue(0);
  const gazeOpacity = useSharedValue(0);
  const ritualCloseOpacity = useSharedValue(0);
  const instructionOpacity = useSharedValue(0);

  // Vignette
  const vignetteIntensity = useSharedValue(0.1);
  const vignettePulse = useSharedValue(0);
  const completionGlow = useSharedValue(0);

  // Progress bar color
  const progressColorValue = useSharedValue(0);

  // --- Pulsing mic animation ---
  useEffect(() => {
    if (isListening && !isTransitioning && phase === PHASES.AFFIRMING) {
      micScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      micOpacity.value = withRepeat(
        withSequence(
          withTiming(1.0, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      micScale.value = withTiming(1.0, { duration: 300 });
      micOpacity.value = withTiming(0.7, { duration: 300 });
    }
  }, [isListening, isTransitioning, phase]);

  // --- Cleanup ---
  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  // --- Camera permission on mount ---
  useEffect(() => {
    const setup = async () => {
      try {
        const status = permission?.status;
        if (status !== 'granted') {
          const result = await requestPermission();
          if (!result.granted) {
            Alert.alert(
              'Camera Permission',
              'Camera access helps you see yourself during your practice. You can enable it in Settings.',
              [{ text: 'Continue', style: 'default' }]
            );
          }
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

  // --- Load session data ---
  useEffect(() => {
    loadSessionData();
  }, [isPro, user?.id, sessionAffirmationCount, timeOfDay]);

  const loadSessionData = async () => {
    try {
      const routeMood = route.params?.mood;
      const currentFeeling = routeMood?.id || await storageService.getCurrentFeeling();
      if (currentFeeling) setFeeling(currentFeeling);

      try {
        const routeFocus = route.params?.focusArea;
        const prompts = await affirmationService.getPersonalizedForSession(
          currentFeeling,
          {
            isPro,
            userId: user?.id,
            count: sessionAffirmationCount,
            timeOfDay,
            focusAreaId: routeFocus?.id || null,
          }
        );

        if (prompts && prompts.length > 0) {
          setSessionAffirmations(prompts.slice(0, sessionAffirmationCount));
        } else {
          useLocalPrompts();
        }
      } catch (error) {
        console.log('Using local prompts:', error.message);
        useLocalPrompts();
      }
    } catch (error) {
      console.error('Error loading session data:', error);
      useLocalPrompts();
    } finally {
      setIsLoadingPrompts(false);
    }
  };

  const useLocalPrompts = () => {
    const shuffled = [...FALLBACK_AFFIRMATIONS].sort(() => Math.random() - 0.5);
    setSessionAffirmations(
      shuffled.slice(0, sessionAffirmationCount).map((text, index) => ({
        id: `local-${index}`,
        text,
        colors: [c.primaryStart, c.feelingPink],
      }))
    );
  };

  // --- Keep refs in sync ---
  useEffect(() => { partialRef.current = partial; }, [partial]);
  useEffect(() => { finalTextRef.current = finalText; }, [finalText]);

  // --- Speech matcher updates ---
  useEffect(() => {
    if (partial && partial !== ignoredPartial.current && !isTransitioning && phase === PHASES.AFFIRMING) {
      updateWithSpeech(partial);
    }
  }, [partial, isTransitioning, phase, updateWithSpeech]);

  useEffect(() => {
    if (finalText && finalText !== ignoredFinal.current && !isTransitioning && phase === PHASES.AFFIRMING) {
      updateWithSpeech(finalText);
    }
  }, [finalText, isTransitioning, phase, updateWithSpeech]);

  // --- Auto-start listening ---
  const beginListening = useCallback(async () => {
    if (isSpeechSupported && !isListening) {
      try {
        await startListening({ language: 'en-US' });
      } catch (e) {
        console.log('Failed to start listening:', e);
      }
    }
  }, [isSpeechSupported, isListening, startListening]);

  useEffect(() => {
    if (phase === PHASES.AFFIRMING && isSpeechSupported && !isTransitioning) {
      const timer = setTimeout(() => { beginListening(); }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, isSpeechSupported, isTransitioning, beginListening]);

  // ============================================================
  // BREATHING PHASE
  // ============================================================
  useEffect(() => {
    if (phase !== PHASES.BREATHING) return;

    let cancelled = false;
    let breathCount = 0;

    const onPhaseChange = (p) => {
      if (!isMountedRef.current) return;
      setBreathPhase(p);
      if (p === 'inhale') breathingPulse();
    };

    const runCycle = () => {
      if (cancelled) return;

      // Inhale
      onPhaseChange('inhale');
      circleScale.value = withTiming(1.0, { duration: INHALE_DURATION, easing: Easing.inOut(Easing.ease) });
      circleOpacity.value = withTiming(0.8, { duration: INHALE_DURATION, easing: Easing.inOut(Easing.ease) });

      // Hold
      setTimeout(() => {
        if (cancelled) return;
        onPhaseChange('hold');
      }, INHALE_DURATION);

      // Exhale
      setTimeout(() => {
        if (cancelled) return;
        onPhaseChange('exhale');
        circleScale.value = withTiming(0.6, { duration: EXHALE_DURATION, easing: Easing.inOut(Easing.ease) });
        circleOpacity.value = withTiming(0.4, { duration: EXHALE_DURATION, easing: Easing.inOut(Easing.ease) });
      }, INHALE_DURATION + HOLD_DURATION);

      // Next cycle or transition
      setTimeout(() => {
        if (cancelled) return;
        breathCount++;
        if (isMountedRef.current) setCurrentBreath(breathCount);
        if (breathCount < TOTAL_BREATHS) {
          runCycle();
        } else {
          // Breathing complete — reveal camera
          creamOverlayOpacity.value = withTiming(0, {
            duration: 800,
            easing: Easing.out(Easing.ease),
          });
          setTimeout(() => {
            if (cancelled || !isMountedRef.current) return;
            setPhase(PHASES.RITUAL_OPEN);
          }, 900);
        }
      }, BREATH_CYCLE);
    };

    const startTimer = setTimeout(runCycle, 500);
    return () => { cancelled = true; clearTimeout(startTimer); };
  }, [phase]);

  // --- Skip breathing ---
  const handleSkipBreathing = () => {
    creamOverlayOpacity.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) });
    setTimeout(() => {
      if (isMountedRef.current) setPhase(PHASES.RITUAL_OPEN);
    }, 600);
  };

  // ============================================================
  // RITUAL OPEN PHASE
  // ============================================================
  useEffect(() => {
    if (phase !== PHASES.RITUAL_OPEN) return;

    selectionTap();
    ritualOpenOpacity.value = withTiming(1, { duration: 500 });

    const timer = setTimeout(() => {
      if (!isMountedRef.current) return;
      ritualOpenOpacity.value = withTiming(0, { duration: 500 });
      setTimeout(() => {
        if (isMountedRef.current) setPhase(PHASES.GAZE);
      }, 600);
    }, RITUAL_OPEN_DURATION - 500);

    return () => clearTimeout(timer);
  }, [phase]);

  // ============================================================
  // GAZE PHASE
  // ============================================================
  useEffect(() => {
    if (phase !== PHASES.GAZE) return;

    gazeOpacity.value = withTiming(1, { duration: 800 });

    // Mid-gaze haptic pulse
    const hapticTimer = setTimeout(() => {
      if (isMountedRef.current) breathingPulse();
    }, 2000);

    const timer = setTimeout(() => {
      if (!isMountedRef.current) return;
      gazeOpacity.value = withTiming(0, { duration: 600 });
      setTimeout(() => {
        if (isMountedRef.current) setPhase(PHASES.INSTRUCTION);
      }, 700);
    }, GAZE_PROMPT_DURATION);

    return () => { clearTimeout(timer); clearTimeout(hapticTimer); };
  }, [phase]);

  // ============================================================
  // INSTRUCTION PHASE (shown only before first affirmation)
  // ============================================================
  useEffect(() => {
    if (phase !== PHASES.INSTRUCTION) return;

    instructionOpacity.value = withTiming(1, { duration: 300 });

    const timer = setTimeout(() => {
      if (!isMountedRef.current) return;
      instructionOpacity.value = withTiming(0, { duration: 300 });
      setTimeout(() => {
        if (isMountedRef.current) {
          sessionStartTimeRef.current = Date.now();
          setAffirmationStartTime(Date.now());

          // Start vignette breathing pulse
          vignettePulse.value = withRepeat(
            withSequence(
              withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
              withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
          );

          affirmationOpacity.value = 0;
          affirmationOpacity.value = withTiming(1, { duration: 500 });
          setPhase(PHASES.AFFIRMING);
        }
      }, 400);
    }, INSTRUCTION_DURATION - 300);

    return () => clearTimeout(timer);
  }, [phase]);

  // ============================================================
  // AFFIRMING PHASE — Handle completion
  // ============================================================
  useEffect(() => {
    if (isComplete && !isTransitioning && !hasHandledCompletion.current && phase === PHASES.AFFIRMING) {
      hasHandledCompletion.current = true;
      setIsTransitioning(true);

      ignoredPartial.current = partialRef.current;
      ignoredFinal.current = finalTextRef.current;

      const newCompletedCount = completedCount + 1;
      completedCountRef.current = newCompletedCount;
      setCompletedCount(newCompletedCount);

      // Haptic
      successPulse();

      // Warm glow on completion
      completionGlow.value = withSequence(
        withTiming(0.1, { duration: 150 }),
        withTiming(0, { duration: 300 })
      );

      // Animate progress bar
      const newProgress = (newCompletedCount / totalCount) * 100;
      progressWidth.value = withTiming(newProgress, { duration: 600, easing: Easing.out(Easing.ease) });
      progressColorValue.value = withTiming(newProgress / 100, { duration: 600 });

      // Evolve vignette warmth
      const newIntensity = 0.1 + (newCompletedCount / totalCount) * 0.15;
      vignetteIntensity.value = withTiming(newIntensity, { duration: 600 });

      // Completion overlay
      completionOpacity.value = withTiming(1, { duration: 400 });
      completionScale.value = withSpring(1.0, { damping: 12, stiffness: 150, mass: 0.5 });
      affirmationOpacity.value = withTiming(0, { duration: 300 });

      // Advance completion message index
      setCompletionMessageIndex(prev => prev + 1);

      // Record engagement
      const completionTimeSeconds = affirmationStartTime ? (Date.now() - affirmationStartTime) / 1000 : null;
      const currentAff = sessionAffirmations[currentIndex % sessionAffirmations.length];
      if (user && currentAff && !currentAff.id.startsWith('local-')) {
        sessionService.recordAffirmationEngagement(
          currentAff.id, true, currentSessionId, completionTimeSeconds
        ).catch(err => console.log('Failed to record engagement:', err));

        if (completionTimeSeconds && currentAff.text) {
          const wordCount = currentAff.text.split(/\s+/).length;
          personalizationService.updateVoicePacing(user.id, wordCount, completionTimeSeconds)
            .catch(err => console.log('Failed to update voice pacing:', err));
        }
      }

      // Stop listening
      if (isListening) stopListening();

      const isSessionComplete = newCompletedCount >= totalCount;
      const transitionTime = isSessionComplete ? SESSION_END_DURATION : TRANSITION_DURATION;

      if (isSessionComplete) {
        setTimeout(() => celebrationBurst(), 400);
      }

      setTimeout(() => {
        if (!isMountedRef.current) return;

        if (isSessionComplete) {
          // Move to ritual close
          completionOpacity.value = withTiming(0, { duration: 300 });
          completionScale.value = 0.5;
          // Stop vignette pulse
          vignettePulse.value = withTiming(0, { duration: 500 });
          setTimeout(() => {
            if (isMountedRef.current) setPhase(PHASES.RITUAL_CLOSE);
          }, 400);
        } else {
          // Next affirmation
          completionOpacity.value = withTiming(0, { duration: 200 });
          completionScale.value = 0.5;
          hasHandledCompletion.current = false;
          setCurrentIndex(prev => prev + 1);

          affirmationOpacity.value = 0;
          setTimeout(() => {
            if (isMountedRef.current) {
              affirmationOpacity.value = withTiming(1, { duration: 400 });
            }
          }, 100);

          setTimeout(() => {
            if (isMountedRef.current) setIsTransitioning(false);
          }, 200);
        }
      }, transitionTime);
    }
  }, [isComplete, isTransitioning, completedCount, isListening, stopListening, sessionAffirmations, currentIndex, currentSessionId, user, phase]);

  // Reset completion flag and start time on affirmation change
  useEffect(() => {
    hasHandledCompletion.current = false;
    if (phase === PHASES.AFFIRMING) {
      setAffirmationStartTime(Date.now());
    }
  }, [currentIndex, phase]);

  // ============================================================
  // RITUAL CLOSE PHASE
  // ============================================================
  useEffect(() => {
    if (phase !== PHASES.RITUAL_CLOSE) return;

    ritualCloseOpacity.value = withTiming(1, { duration: 500 });

    // Gentle vignette pulse
    vignetteIntensity.value = withSequence(
      withTiming(0.25, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      withTiming(0.15, { duration: 1500, easing: Easing.inOut(Easing.ease) })
    );

    const timer = setTimeout(() => {
      if (!isMountedRef.current) return;
      ritualCloseOpacity.value = withTiming(0, { duration: 500 });
      setTimeout(() => {
        if (isMountedRef.current) {
          setPhase(PHASES.COMPLETE);
          handleComplete();
        }
      }, 600);
    }, RITUAL_CLOSE_DURATION);

    return () => clearTimeout(timer);
  }, [phase]);

  // ============================================================
  // SESSION COMPLETE / EXIT
  // ============================================================
  const getSessionDuration = () => {
    if (!sessionStartTimeRef.current) return 0;
    return Math.round((Date.now() - sessionStartTimeRef.current) / 1000);
  };

  const handleComplete = async () => {
    if (isListening) {
      try { await stopListening(); } catch (e) { /* ignore */ }
    }
    const count = completedCountRef.current;
    const duration = getSessionDuration();
    let sessionId = null;
    try {
      const session = await recordSession({
        feeling,
        completedPrompts: count,
        duration,
        timeOfDay,
        focusAreaId: route.params?.focusArea?.id || null,
        moodIntensity: null,
      });
      sessionId = session?.id || null;
    } catch (e) {
      console.log('Failed to record session:', e);
    }
    navigation.replace('PostMoodReflection', {
      sessionId,
      completedPrompts: count,
      duration,
      feeling,
      preMood: feeling,
      preIntensity: null,
      focusArea: route.params?.focusArea,
    });
  };

  const handleExit = async () => {
    if (isListening) {
      try { await stopListening(); } catch (e) { /* ignore */ }
    }
    const count = completedCountRef.current;
    const duration = getSessionDuration();
    let sessionId = null;
    try {
      const session = await recordSession({
        feeling,
        completedPrompts: count,
        duration,
        timeOfDay,
        focusAreaId: route.params?.focusArea?.id || null,
        moodIntensity: null,
      });
      sessionId = session?.id || null;
    } catch (e) {
      console.log('Failed to record session:', e);
    }
    navigation.replace('PostMoodReflection', {
      sessionId,
      completedPrompts: count,
      duration,
      feeling,
      preMood: feeling,
      preIntensity: null,
      focusArea: route.params?.focusArea,
    });
  };

  // ============================================================
  // COMPLETION MESSAGE SELECTION
  // ============================================================
  const getCompletionMessage = () => {
    const isLast = completedCount >= totalCount;
    if (isLast) {
      return FINAL_COMPLETION_MESSAGES[completionMessageIndex % FINAL_COMPLETION_MESSAGES.length];
    }
    return COMPLETION_MESSAGES[completionMessageIndex % COMPLETION_MESSAGES.length];
  };

  // ============================================================
  // ANIMATED STYLES
  // ============================================================
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const completionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: completionOpacity.value,
    transform: [{ scale: completionScale.value }],
  }));

  const affirmationAnimatedStyle = useAnimatedStyle(() => ({
    opacity: affirmationOpacity.value,
  }));

  const gazeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: gazeOpacity.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const progressFillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progressColorValue.value,
      [0, 1],
      [c.accentPeach, c.accentRust]
    ),
  }));

  const micAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micScale.value }],
    opacity: micOpacity.value,
  }));

  const creamOverlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: creamOverlayOpacity.value,
  }));

  const circleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: circleOpacity.value,
  }));

  const ritualOpenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: ritualOpenOpacity.value,
  }));

  const ritualCloseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: ritualCloseOpacity.value,
  }));

  const instructionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: instructionOpacity.value,
  }));

  // Dynamic vignette opacity with pulse + completion glow
  const vignetteAnimatedOpacity = useAnimatedStyle(() => {
    const base = vignetteIntensity.value;
    const pulse = vignettePulse.value * 0.02;
    const glow = completionGlow.value;
    return { opacity: base + pulse + glow };
  });

  // Streak context line
  const currentStreak = stats?.currentStreak || 0;
  const contextLine = currentStreak > 0
    ? `Day ${currentStreak + 1} of your practice`
    : 'Welcome back.';

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (isLoadingPrompts) {
    return (
      <View style={styles.darkContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={c.accentRust} />
          <Text style={[styles.loadingText, { color: c.textMuted }]}>Preparing your practice...</Text>
        </View>
      </View>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  const isBreathingPhase = phase === PHASES.BREATHING;
  const isCameraPhase = !isBreathingPhase;

  return (
    <View style={styles.darkContainer}>
      <StatusBar barStyle={isBreathingPhase ? c.statusBarStyle : 'light-content'} />

      {/* Camera — always mounted, renders behind everything */}
      <View style={StyleSheet.absoluteFill}>
        {cameraEnabled && (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="front"
            onMountError={(e) => {
              console.error('Camera mount error:', e);
              setCameraEnabled(false);
            }}
          />
        )}

        {/* No camera fallback */}
        {!cameraEnabled && <View style={styles.noCameraBackground} />}
      </View>

      {/* Vignette overlays — always visible on camera, opacity animates */}
      <Animated.View style={[styles.vignetteTop, vignetteAnimatedOpacity]} pointerEvents="none">
        <LinearGradient
          colors={['rgba(193, 118, 102, 1)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View style={[styles.vignetteBottom, vignetteAnimatedOpacity]} pointerEvents="none">
        <LinearGradient
          colors={['transparent', 'rgba(193, 118, 102, 1)']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View style={[styles.vignetteLeft, vignetteAnimatedOpacity]} pointerEvents="none">
        <LinearGradient
          colors={['rgba(193, 118, 102, 1)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0.3, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View style={[styles.vignetteRight, vignetteAnimatedOpacity]} pointerEvents="none">
        <LinearGradient
          colors={['transparent', 'rgba(193, 118, 102, 1)']}
          start={{ x: 0.7, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* ===== BREATHING OVERLAY ===== */}
      <Animated.View
        style={[styles.breathingOverlay, { backgroundColor: c.background }, creamOverlayAnimatedStyle]}
        pointerEvents={isBreathingPhase ? 'auto' : 'none'}
      >
        <SafeAreaView style={styles.breathingContent}>
          {/* Context line */}
          <Text style={[styles.contextLine, { color: c.textSecondary }]}>{contextLine}</Text>

          {/* Breathing circle */}
          <View style={styles.breathingSection}>
            <Animated.View style={[styles.breathingCircle, circleAnimatedStyle]}>
              <View style={styles.breathingCircleInner}>
                <Text style={[styles.breathingPhaseLabel, { color: c.accentRust }]}>{PHASE_LABELS[breathPhase]}</Text>
              </View>
            </Animated.View>

            {/* Progress dots */}
            <View style={styles.progressDots}>
              {Array.from({ length: TOTAL_BREATHS }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.progressDot,
                    { backgroundColor: c.accentPeach },
                    i < currentBreath && { backgroundColor: c.accentRust },
                    i === currentBreath && phase === PHASES.BREATHING && { backgroundColor: c.feelingPink },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Skip */}
          <Pressable onPress={handleSkipBreathing} hitSlop={12} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: c.textMuted }]}>Skip</Text>
          </Pressable>
        </SafeAreaView>
      </Animated.View>

      {/* ===== RITUAL OPEN ===== */}
      {phase === PHASES.RITUAL_OPEN && (
        <View style={styles.centerOverlay} pointerEvents="none">
          <Animated.View style={ritualOpenAnimatedStyle}>
            <Text style={styles.ritualText}>Your practice begins now.</Text>
          </Animated.View>
        </View>
      )}

      {/* ===== GAZE PROMPT ===== */}
      {phase === PHASES.GAZE && (
        <View style={styles.centerOverlay} pointerEvents="none">
          <Animated.View style={[styles.gazeContainer, gazeAnimatedStyle]}>
            <Text style={styles.gazeText}>{gazePrompt}</Text>
          </Animated.View>
        </View>
      )}

      {/* ===== SPEAKING INSTRUCTION ===== */}
      {phase === PHASES.INSTRUCTION && (
        <View style={styles.centerOverlay} pointerEvents="none">
          <Animated.View style={instructionAnimatedStyle}>
            <Text style={styles.instructionText}>{speakingInstruction}</Text>
          </Animated.View>
        </View>
      )}

      {/* ===== AFFIRMING PHASE ===== */}
      {phase === PHASES.AFFIRMING && (
        <>
          {isComplete && isTransitioning ? (
            /* Completion overlay */
            <View style={styles.centerOverlay} pointerEvents="none">
              <Animated.View style={[styles.completedIndicator, completionAnimatedStyle]}>
                <Ionicons name="checkmark-circle" size={48} color="#34D399" />
                <Text style={[
                  styles.completedText,
                  completedCount >= totalCount && styles.completedTextFinal,
                ]}>
                  {getCompletionMessage()}
                </Text>
              </Animated.View>
            </View>
          ) : (
            /* Affirmation text */
            <View style={styles.affirmationOverlay} pointerEvents="none">
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.5)']}
                style={styles.promptGradient}
              >
                <Animated.View style={affirmationAnimatedStyle}>
                  <AffirmationHighlightText
                    tokens={displayTokens}
                    activeToken={activeToken}
                    style={styles.promptText}
                    spokenStyle={styles.promptSpoken}
                    currentStyle={styles.promptCurrent}
                    pendingStyle={styles.promptPending}
                  />
                </Animated.View>
              </LinearGradient>
            </View>
          )}

          {/* Listening indicator */}
          {isListening && !isTransitioning && (
            <View style={[styles.listeningPosition, { bottom: insets.bottom + 56 }]}>
              <Animated.View style={[styles.listeningIndicator, micAnimatedStyle]}>
                <Ionicons name="mic" size={14} color="#A7F3D0" />
                <Text style={styles.listeningBadge}>Listening...</Text>
              </Animated.View>
            </View>
          )}

          {/* Progress bar */}
          <View style={[styles.progressWrap, { bottom: insets.bottom + 20 }]}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, progressAnimatedStyle, progressFillStyle]} />
            </View>
          </View>
        </>
      )}

      {/* ===== RITUAL CLOSE ===== */}
      {phase === PHASES.RITUAL_CLOSE && (
        <View style={styles.centerOverlay} pointerEvents="none">
          <Animated.View style={ritualCloseAnimatedStyle}>
            <Text style={styles.ritualCloseText}>Take one more breath.</Text>
          </Animated.View>
        </View>
      )}

      {/* ===== EXIT BUTTON (subtle X) ===== */}
      {isCameraPhase && phase !== PHASES.RITUAL_CLOSE && phase !== PHASES.COMPLETE && (
        <Pressable
          onPress={handleExit}
          style={[styles.exitButton, { top: insets.top + 12, right: 16 }]}
          hitSlop={12}
          accessibilityLabel="Exit session"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={18} color="rgba(255,255,255,0.4)" />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  darkContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  noCameraBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
  },

  // --- Vignettes (full-bleed, no border radius) ---
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
    height: '25%',
    zIndex: 1,
  },
  vignetteLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '20%',
    zIndex: 1,
  },
  vignetteRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '20%',
    zIndex: 1,
  },

  // --- Breathing overlay (sits on top of camera) ---
  breathingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  breathingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  contextLine: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
  },
  breathingSection: {
    alignItems: 'center',
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
    textAlign: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  skipButton: {
    position: 'absolute',
    bottom: 60,
  },
  skipText: {
    fontSize: 14,
  },

  // --- Center overlay (for ritual open, gaze, instruction, ritual close) ---
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Ritual open
  ritualText: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 22,
    fontStyle: 'italic',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
    lineHeight: 36,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // Speaking instruction
  instructionText: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },

  // Ritual close
  ritualCloseText: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 20,
    fontStyle: 'italic',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // --- Affirming phase ---
  affirmationOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  promptGradient: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
    alignItems: 'center',
  },
  promptText: {
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  promptSpoken: { color: 'rgba(255, 255, 255, 0.95)' },
  promptCurrent: { color: '#FFFFFF', fontWeight: '500' },
  promptPending: { color: 'rgba(255, 255, 255, 0.4)' },

  // Completion
  completedIndicator: {
    alignItems: 'center',
    gap: 12,
  },
  completedText: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 20,
    fontStyle: 'italic',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    paddingHorizontal: 32,
  },
  completedTextFinal: {
    fontSize: 22,
  },

  // Listening indicator
  listeningPosition: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 6,
  },
  listeningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listeningBadge: { color: '#A7F3D0', fontSize: 12 },

  // Progress bar
  progressWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 6,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Exit button
  exitButton: {
    position: 'absolute',
    zIndex: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
