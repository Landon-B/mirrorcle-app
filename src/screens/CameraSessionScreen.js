import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
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

export const CameraSessionScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraEnabled, setCameraEnabled] = useState(false);
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
  const { recordSession } = useStats();
  const { isPro, user, preferences } = useApp();
  const { streakEncouragement, timeOfDay } = usePersonalization();

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
  const isMountedRef = useRef(true);
  const partialRef = useRef('');
  const finalTextRef = useRef('');
  const completedCountRef = useRef(0);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (innerTransitionTimerRef.current) clearTimeout(innerTransitionTimerRef.current);
    };
  }, []);

  // Load feeling and prompts
  useEffect(() => {
    loadSessionData();
  }, [isPro, user?.id, sessionAffirmationCount, timeOfDay]);

  const loadSessionData = async () => {
    try {
      const currentFeeling = await storageService.getCurrentFeeling();
      if (currentFeeling) {
        setFeeling(currentFeeling);
      }

      // Try to load personalized prompts from Supabase
      try {
        const prompts = await affirmationService.getPersonalizedForSession(
          currentFeeling,
          {
            isPro,
            userId: user?.id,
            count: sessionAffirmationCount,
            timeOfDay,
          }
        );

        if (prompts && prompts.length > 0) {
          setSessionAffirmations(prompts.slice(0, sessionAffirmationCount));
        } else {
          // Fallback to local prompts
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
        colors: ['#A855F7', '#EC4899'],
      }))
    );
  };

  // Keep refs in sync for use in completion effect without triggering it
  useEffect(() => { partialRef.current = partial; }, [partial]);
  useEffect(() => { finalTextRef.current = finalText; }, [finalText]);

  // Update speech matcher with recognized speech - ignore stale data from previous affirmation
  useEffect(() => {
    if (partial && partial !== ignoredPartial.current && !isTransitioning) {
      updateWithSpeech(partial);
    }
  }, [partial, isTransitioning, updateWithSpeech]);

  useEffect(() => {
    if (finalText && finalText !== ignoredFinal.current && !isTransitioning) {
      updateWithSpeech(finalText);
    }
  }, [finalText, isTransitioning, updateWithSpeech]);

  // Auto-start listening when session begins
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
    if (sessionStarted && isSpeechSupported && !isTransitioning) {
      const timer = setTimeout(() => {
        beginListening();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [sessionStarted, isSpeechSupported, isTransitioning, beginListening]);

  // Handle affirmation completion and transition
  useEffect(() => {
    if (isComplete && !isTransitioning && !hasHandledCompletion.current) {
      hasHandledCompletion.current = true;
      setIsTransitioning(true);

      // Capture current speech values IMMEDIATELY to ignore them for next affirmation
      ignoredPartial.current = partialRef.current;
      ignoredFinal.current = finalTextRef.current;

      const newCompletedCount = completedCount + 1;
      completedCountRef.current = newCompletedCount;
      setCompletedCount(newCompletedCount);

      // Calculate completion time for voice pacing
      const completionTimeSeconds = affirmationStartTime
        ? (Date.now() - affirmationStartTime) / 1000
        : null;

      // Record affirmation engagement in Supabase
      const currentAff = sessionAffirmations[currentIndex % sessionAffirmations.length];
      if (user && currentAff && !currentAff.id.startsWith('local-')) {
        sessionService.recordAffirmationEngagement(
          currentAff.id,
          true, // engaged (spoken)
          currentSessionId,
          completionTimeSeconds
        ).catch(err => console.log('Failed to record engagement:', err));

        // Update voice pacing
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

      // Check if session is complete (3 affirmations done)
      if (newCompletedCount >= totalCount) {
        // Session complete - navigate to reflection after delay
        transitionTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) handleComplete();
        }, 1200);
      } else {
        // Transition to next affirmation
        transitionTimerRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;
          hasHandledCompletion.current = false;
          setCurrentIndex((prev) => prev + 1);
          // Small delay before allowing new speech processing
          innerTransitionTimerRef.current = setTimeout(() => {
            if (isMountedRef.current) setIsTransitioning(false);
          }, 100);
        }, 1200);
      }
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
    if (sessionStarted) {
      interval = setInterval(() => setSessionTime((prev) => prev + 1), 1000);
    }
    return () => interval && clearInterval(interval);
  }, [sessionStarted]);

  const startSession = async (withCamera) => {
    if (withCamera) {
      const status = permission?.status;
      if (status !== 'granted') {
        const result = await requestPermission();
        if (!result.granted) {
          Alert.alert(
            'Camera Permission Required',
            'Camera access is needed to see yourself during the session. You can enable it in Settings, or continue without camera.',
            [
              { text: 'Continue Without Camera', onPress: () => setSessionStarted(true) },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
          return;
        }
      }
      setCameraEnabled(true);
    }
    setSessionStarted(true);
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
      });
    } catch (e) {
      console.log('Failed to record session:', e);
    }
    navigation.replace('Reflection', {
      sessionDuration: sessionTime,
      completedCount: count,
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
      });
    } catch (e) {
      console.log('Failed to record session:', e);
    }
    navigation.replace('Reflection', {
      sessionDuration: sessionTime,
      completedCount: count,
    });
  };

  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (isLoadingPrompts) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A855F7" />
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
              {cameraEnabled && <CameraView style={styles.cameraView} facing="front" />}
              {isComplete && isTransitioning ? (
                <View style={[styles.cameraOverlay, !cameraEnabled && styles.noCameraOverlay, styles.completionOverlay]}>
                  <View style={styles.completedIndicator}>
                    <Ionicons name="checkmark-circle" size={48} color="#34D399" />
                    <Text style={styles.completedText}>
                      {completedCount >= totalCount
                        ? "Session Complete!"
                        : "Great job!"}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={[styles.cameraOverlay, !cameraEnabled && styles.noCameraOverlay]}>
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.promptGradient}
                  >
                    <AffirmationHighlightText
                      tokens={displayTokens}
                      activeToken={activeToken}
                      style={styles.promptText}
                      spokenStyle={styles.promptSpoken}
                      currentStyle={styles.promptCurrent}
                      pendingStyle={styles.promptPending}
                      showQuotes
                    />
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
            {isListening ? (
              <View style={styles.listeningIndicator}>
                <Ionicons name="mic" size={14} color="#A7F3D0" />
                <Text style={styles.listeningBadge}>Listening...</Text>
              </View>
            ) : (
              <View />
            )}
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
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
  highlightText: { color: '#C084FC', fontWeight: '600' },
  cameraContainer: { flex: 1, padding: 16 },
  cameraWrapper: { flex: 1, borderRadius: 28, overflow: 'hidden' },
  cameraView: { flex: 1 },
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
  promptCurrent: { color: '#C084FC', fontWeight: '700' },
  promptPending: { color: '#E2E8F0' },
  completedIndicator: {
    alignItems: 'center',
    gap: 12,
  },
  completedText: {
    color: '#34D399',
    fontSize: 20,
    fontWeight: '600',
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
  progressFill: { height: '100%', backgroundColor: '#A855F7' },
  rowButtons: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingBottom: 16, marginTop: 16 },
  flexButton: { flex: 1 },
});
