import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { GradientBackground, PrimaryButton, GhostButton } from '../components/common';
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
import { formatTime } from '../utils/dateUtils';
import { useHaptics } from '../hooks/useHaptics';
import { typography } from '../styles/typography';

const GAZE_PROMPT_DURATION = 3500;
const TRANSITION_DURATION = 2500;
const SESSION_END_DURATION = 3000;

export const CameraSessionScreen = ({ navigation, route }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [sessionAffirmations, setSessionAffirmations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [feeling, setFeeling] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [affirmationStartTime, setAffirmationStartTime] = useState(null);
  const [showGazePrompt, setShowGazePrompt] = useState(false);
  const { recordSession } = useStats();
  const { isPro, user, preferences } = useApp();
  const { streakEncouragement, timeOfDay } = usePersonalization();
  const { successPulse, celebrationBurst, selectionTap } = useHaptics();

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

  const hasHandledCompletion = useRef(false);
  const ignoredPartial = useRef('');
  const ignoredFinal = useRef('');
  const transitionTimerRef = useRef(null);
  const innerTransitionTimerRef = useRef(null);
  const gazeTimerRef = useRef(null);
  const isMountedRef = useRef(true);
  const partialRef = useRef('');
  const finalTextRef = useRef('');
  const completedCountRef = useRef(0);

  // Animated values
  const progressWidth = useSharedValue(0);
  const completionOpacity = useSharedValue(0);
  const completionScale = useSharedValue(0.5);
  const affirmationOpacity = useSharedValue(1);
  const gazeOpacity = useSharedValue(0);
  const micScale = useSharedValue(1);
  const micOpacity = useSharedValue(0.7);

  // Pulsing mic animation
  useEffect(() => {
    if (isListening && !isTransitioning && !showGazePrompt) {
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
  }, [isListening, isTransitioning, showGazePrompt]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (innerTransitionTimerRef.current) clearTimeout(innerTransitionTimerRef.current);
      if (gazeTimerRef.current) clearTimeout(gazeTimerRef.current);
    };
  }, []);

  // Load feeling and prompts
  useEffect(() => {
    loadSessionData();
  }, [isPro, user?.id, sessionAffirmationCount, timeOfDay]);

  const loadSessionData = async () => {
    try {
      const routeMood = route.params?.mood;
      const currentFeeling = routeMood?.id || await storageService.getCurrentFeeling();
      if (currentFeeling) {
        setFeeling(currentFeeling);
      }

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
        colors: ['#C17666', '#E8A090'],
      }))
    );
  };

  // Keep refs in sync
  useEffect(() => { partialRef.current = partial; }, [partial]);
  useEffect(() => { finalTextRef.current = finalText; }, [finalText]);

  // Update speech matcher — ignore stale data from previous affirmation
  useEffect(() => {
    if (partial && partial !== ignoredPartial.current && !isTransitioning && !showGazePrompt) {
      updateWithSpeech(partial);
    }
  }, [partial, isTransitioning, showGazePrompt, updateWithSpeech]);

  useEffect(() => {
    if (finalText && finalText !== ignoredFinal.current && !isTransitioning && !showGazePrompt) {
      updateWithSpeech(finalText);
    }
  }, [finalText, isTransitioning, showGazePrompt, updateWithSpeech]);

  // Auto-start listening when session begins (after gaze prompt)
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
    if (sessionStarted && isSpeechSupported && !isTransitioning && !showGazePrompt) {
      const timer = setTimeout(() => {
        beginListening();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [sessionStarted, isSpeechSupported, isTransitioning, showGazePrompt, beginListening]);

  // Handle affirmation completion with ceremony
  useEffect(() => {
    if (isComplete && !isTransitioning && !hasHandledCompletion.current) {
      hasHandledCompletion.current = true;
      setIsTransitioning(true);

      // Capture current speech values to ignore for next affirmation
      ignoredPartial.current = partialRef.current;
      ignoredFinal.current = finalTextRef.current;

      const newCompletedCount = completedCount + 1;
      completedCountRef.current = newCompletedCount;
      setCompletedCount(newCompletedCount);

      // Haptic success pulse
      successPulse();

      // Animate progress bar
      const newProgress = (newCompletedCount / totalCount) * 100;
      progressWidth.value = withTiming(newProgress, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      });

      // Animate completion overlay (fade in + scale up)
      completionOpacity.value = withTiming(1, { duration: 400 });
      completionScale.value = withSpring(1.0, {
        damping: 12,
        stiffness: 150,
        mass: 0.5,
      });

      // Fade out affirmation text
      affirmationOpacity.value = withTiming(0, { duration: 300 });

      // Calculate completion time for voice pacing
      const completionTimeSeconds = affirmationStartTime
        ? (Date.now() - affirmationStartTime) / 1000
        : null;

      // Record affirmation engagement
      const currentAff = sessionAffirmations[currentIndex % sessionAffirmations.length];
      if (user && currentAff && !currentAff.id.startsWith('local-')) {
        sessionService.recordAffirmationEngagement(
          currentAff.id,
          true,
          currentSessionId,
          completionTimeSeconds
        ).catch(err => console.log('Failed to record engagement:', err));

        if (completionTimeSeconds && currentAff.text) {
          const wordCount = currentAff.text.split(/\s+/).length;
          personalizationService.updateVoicePacing(user.id, wordCount, completionTimeSeconds)
            .catch(err => console.log('Failed to update voice pacing:', err));
        }
      }

      // Stop listening during transition
      if (isListening) {
        stopListening();
      }

      const isSessionComplete = newCompletedCount >= totalCount;
      const transitionTime = isSessionComplete ? SESSION_END_DURATION : TRANSITION_DURATION;

      if (isSessionComplete) {
        // Extra celebration haptic for session completion
        setTimeout(() => celebrationBurst(), 400);
      }

      transitionTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;

        if (isSessionComplete) {
          handleComplete();
        } else {
          // Reset completion animation
          completionOpacity.value = withTiming(0, { duration: 200 });
          completionScale.value = 0.5;

          hasHandledCompletion.current = false;
          setCurrentIndex((prev) => prev + 1);

          // Fade in next affirmation
          affirmationOpacity.value = 0;
          setTimeout(() => {
            if (isMountedRef.current) {
              affirmationOpacity.value = withTiming(1, { duration: 400 });
            }
          }, 100);

          innerTransitionTimerRef.current = setTimeout(() => {
            if (isMountedRef.current) setIsTransitioning(false);
          }, 200);
        }
      }, transitionTime);
    }
  }, [isComplete, isTransitioning, completedCount, isListening, stopListening, sessionAffirmations, currentIndex, currentSessionId, user]);

  // Reset completion flag and start time when affirmation changes
  useEffect(() => {
    hasHandledCompletion.current = false;
    if (sessionStarted) {
      setAffirmationStartTime(Date.now());
    }
  }, [currentIndex, sessionStarted]);

  // Session timer
  useEffect(() => {
    let interval;
    if (sessionStarted && !showGazePrompt) {
      interval = setInterval(() => setSessionTime((prev) => prev + 1), 1000);
    }
    return () => interval && clearInterval(interval);
  }, [sessionStarted, showGazePrompt]);

  const startSession = async (withCamera) => {
    try {
      if (withCamera) {
        const status = permission?.status;
        if (status !== 'granted') {
          const result = await requestPermission();
          if (!result.granted) {
            Alert.alert(
              'Camera Permission Required',
              'Camera access is needed to see yourself during the session. You can enable it in Settings, or continue without camera.',
              [
                { text: 'Continue Without Camera', onPress: () => beginSession(false) },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
            return;
          }
        }
        beginSession(true);
      } else {
        beginSession(false);
      }
    } catch (error) {
      console.error('Failed to start session with camera:', error);
      beginSession(false);
    }
  };

  const beginSession = (withCamera) => {
    setCameraEnabled(withCamera);
    setSessionStarted(true);
    // Show gaze prompt before first affirmation
    setShowGazePrompt(true);
    selectionTap();

    // Fade in the gaze prompt
    gazeOpacity.value = withTiming(1, { duration: 800 });

    gazeTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      // Fade out gaze prompt
      gazeOpacity.value = withTiming(0, { duration: 600 });
      setTimeout(() => {
        if (isMountedRef.current) {
          setShowGazePrompt(false);
          // Fade in first affirmation
          affirmationOpacity.value = 0;
          affirmationOpacity.value = withTiming(1, { duration: 500 });
        }
      }, 600);
    }, GAZE_PROMPT_DURATION);
  };

  const handleComplete = async () => {
    if (isListening) {
      try { await stopListening(); } catch (e) { /* ignore */ }
    }
    const count = completedCountRef.current;
    try {
      await recordSession({
        feeling,
        completedPrompts: count,
        duration: sessionTime,
        timeOfDay,
        focusAreaId: route.params?.focusArea?.id || null,
      });
    } catch (e) {
      console.log('Failed to record session:', e);
    }
    navigation.replace('PostMoodReflection', {
      completedPrompts: count,
      duration: sessionTime,
      feeling,
      preMood: feeling,
    });
  };

  const handleExit = async () => {
    if (isListening) {
      try { await stopListening(); } catch (e) { /* ignore */ }
    }
    const count = completedCountRef.current;
    try {
      await recordSession({
        feeling,
        completedPrompts: count,
        duration: sessionTime,
        timeOfDay,
        focusAreaId: route.params?.focusArea?.id || null,
      });
    } catch (e) {
      console.log('Failed to record session:', e);
    }
    navigation.replace('PostMoodReflection', {
      completedPrompts: count,
      duration: sessionTime,
      feeling,
      preMood: feeling,
    });
  };

  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Animated styles
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

  const micAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micScale.value }],
    opacity: micOpacity.value,
  }));

  if (isLoadingPrompts) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C17666" />
            <Text style={styles.loadingText}>Loading your personalized prompts...</Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionTitle}>Your Mirror Session</Text>
          <Text style={styles.sessionSubtitle}>
            Feeling: <Text style={styles.highlightText}>{feeling}</Text> • Time: {formatTime(sessionTime)}
          </Text>
        </View>

        <View style={styles.cameraContainer}>
          {sessionStarted ? (
            <View style={styles.cameraWrapper}>
              {cameraEnabled && !cameraError && (
                <CameraView
                  style={styles.cameraView}
                  facing="front"
                  onMountError={(e) => {
                    console.error('Camera mount error:', e);
                    setCameraError(e);
                  }}
                />
              )}

              {/* Warm vignette overlay */}
              {cameraEnabled && (
                <>
                  <LinearGradient
                    colors={['rgba(193, 118, 102, 0.2)', 'transparent']}
                    style={styles.vignetteTop}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(193, 118, 102, 0.15)']}
                    style={styles.vignetteBottom}
                  />
                  <LinearGradient
                    colors={['rgba(193, 118, 102, 0.15)', 'transparent']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 0.3, y: 0.5 }}
                    style={styles.vignetteLeft}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(193, 118, 102, 0.15)']}
                    start={{ x: 0.7, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.vignetteRight}
                  />
                </>
              )}

              {/* Gaze prompt — shown before first affirmation */}
              {showGazePrompt ? (
                <View style={[styles.cameraOverlay, !cameraEnabled && styles.noCameraOverlay, styles.gazeOverlay]}>
                  <Animated.View style={[styles.gazePromptContainer, gazeAnimatedStyle]}>
                    <Text style={styles.gazePromptText}>Look into your own eyes.</Text>
                  </Animated.View>
                </View>
              ) : isComplete && isTransitioning ? (
                /* Completion overlay with animation */
                <View style={[styles.cameraOverlay, !cameraEnabled && styles.noCameraOverlay, styles.completionOverlay]}>
                  <Animated.View style={[styles.completedIndicator, completionAnimatedStyle]}>
                    <Ionicons name="checkmark-circle" size={48} color="#34D399" />
                    <Text style={styles.completedText}>
                      {completedCount >= totalCount
                        ? "Session Complete"
                        : "Notice how that feels."}
                    </Text>
                  </Animated.View>
                </View>
              ) : (
                /* Affirmation text with fade animation */
                <View style={[styles.cameraOverlay, !cameraEnabled && styles.noCameraOverlay]}>
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
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
                        showQuotes
                      />
                    </Animated.View>
                  </LinearGradient>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Ionicons name="camera" size={48} color="#94A3B8" />
              <Text style={styles.placeholderTitle}>{streakEncouragement}</Text>
              <Text style={styles.placeholderSubtitle}>
                Speak {totalCount} affirmations while looking at yourself in the mirror.
              </Text>
              <View style={styles.placeholderButtons}>
                <PrimaryButton title="Enable Camera" icon="camera" onPress={() => startSession(true)} />
                <GhostButton title="Continue Without Camera" onPress={() => startSession(false)} />
              </View>
            </View>
          )}
        </View>

        <View style={styles.progressWrap}>
          <View style={styles.progressRow}>
            {isListening && !showGazePrompt ? (
              <Animated.View style={[styles.listeningIndicator, micAnimatedStyle]}>
                <Ionicons name="mic" size={14} color="#A7F3D0" />
                <Text style={styles.listeningBadge}>Listening...</Text>
              </Animated.View>
            ) : (
              <View />
            )}
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
          </View>
        </View>

        {sessionStarted && (
          <View style={styles.rowButtons}>
            <GhostButton title="Exit Session" onPress={handleExit} style={styles.flexButton} />
          </View>
        )}
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#CBD5F5',
    fontSize: 16,
  },
  sessionHeader: { alignItems: 'center', paddingHorizontal: 16, marginTop: 12 },
  sessionTitle: { color: '#fff', fontSize: 26, fontWeight: '700' },
  sessionSubtitle: { color: '#CBD5F5', marginTop: 6, fontSize: 14 },
  highlightText: { color: '#E8A090', fontWeight: '600' },
  cameraContainer: { flex: 1, padding: 16 },
  cameraWrapper: { flex: 1, borderRadius: 28, overflow: 'hidden' },
  cameraView: { flex: 1 },
  // Vignette overlays
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '25%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '25%',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  vignetteLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '20%',
  },
  vignetteRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '20%',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
  },
  completionOverlay: {
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gazeOverlay: {
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCameraOverlay: {
    top: 0,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 28,
    justifyContent: 'flex-end',
  },
  promptGradient: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
  },
  promptText: { color: '#fff', fontSize: 24, textAlign: 'center', lineHeight: 34 },
  promptSpoken: { color: '#34D399' },
  promptCurrent: { color: '#E8A090', fontWeight: '700' },
  promptPending: { color: '#E2E8F0' },
  gazePromptContainer: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  gazePromptText: {
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
  completedIndicator: {
    alignItems: 'center',
    gap: 12,
  },
  completedText: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  listeningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listeningBadge: { color: '#A7F3D0', fontSize: 12 },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderTitle: { color: '#E2E8F0', fontSize: 18, marginTop: 12 },
  placeholderSubtitle: { color: '#94A3B8', marginTop: 8, textAlign: 'center' },
  placeholderButtons: { width: '100%', gap: 12, marginTop: 20 },
  progressWrap: { paddingHorizontal: 16, marginTop: 8 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { color: '#94A3B8', fontSize: 12 },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: { height: '100%', backgroundColor: '#C17666', borderRadius: 8 },
  rowButtons: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingBottom: 16, marginTop: 16 },
  flexButton: { flex: 1 },
});
