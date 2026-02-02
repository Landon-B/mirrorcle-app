import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, PrimaryButton, GhostButton } from '../components/common';
import { AffirmationHighlightText } from '../components/affirmation';
import { PROMPTS } from '../constants';
import { useStats } from '../hooks/useStats';
import { useSpeechMatcher } from '../hooks/useSpeechMatcher';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { storageService } from '../services/storage';
import { formatTime } from '../utils/dateUtils';

const SESSION_AFFIRMATION_COUNT = 3;

// Get random affirmations for the session
const getSessionAffirmations = () => {
  const shuffled = [...PROMPTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, SESSION_AFFIRMATION_COUNT);
};

export const CameraSessionScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [sessionAffirmations] = useState(() => getSessionAffirmations());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [feeling, setFeeling] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { recordSession } = useStats();

  const currentAffirmation = sessionAffirmations[currentIndex] || '';
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

  useEffect(() => {
    storageService.getCurrentFeeling().then((value) => {
      if (value) setFeeling(value);
    });
  }, []);

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
      ignoredPartial.current = partial;
      ignoredFinal.current = finalText;

      const newCompletedCount = completedCount + 1;
      setCompletedCount(newCompletedCount);

      // Stop listening during transition
      if (isListening) {
        stopListening();
      }

      // Check if session is complete (3 affirmations done)
      if (newCompletedCount >= SESSION_AFFIRMATION_COUNT) {
        // Session complete - navigate to reflection after delay
        setTimeout(() => {
          handleComplete();
        }, 1200);
      } else {
        // Transition to next affirmation
        setTimeout(() => {
          hasHandledCompletion.current = false;
          setCurrentIndex((prev) => prev + 1);
          // Small delay before allowing new speech processing
          setTimeout(() => {
            setIsTransitioning(false);
          }, 100);
        }, 1200);
      }
    }
  }, [isComplete, isTransitioning, completedCount, isListening, stopListening, partial, finalText]);

  // Reset completion flag when affirmation changes
  useEffect(() => {
    hasHandledCompletion.current = false;
  }, [currentIndex]);

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
        if (!result.granted) return;
      }
      setCameraEnabled(true);
    }
    setSessionStarted(true);
  };

  const handleComplete = async () => {
    if (isListening) {
      await stopListening();
    }
    await recordSession({
      feeling,
      completedPrompts: completedCount,
      duration: sessionTime,
    });
    setCameraEnabled(false);
    setSessionStarted(false);
    navigation.navigate('Reflection');
  };

  const handleExit = async () => {
    if (isListening) {
      await stopListening();
    }
    setCameraEnabled(false);
    setSessionStarted(false);
    navigation.navigate('AffirmationHome');
  };

  const progress = (completedCount / SESSION_AFFIRMATION_COUNT) * 100;

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
              <View style={[styles.cameraOverlay, !cameraEnabled && styles.noCameraOverlay]}>
                <View style={styles.promptCard}>
                  {isComplete && isTransitioning ? (
                    <View style={styles.completedIndicator}>
                      <Ionicons name="checkmark-circle" size={48} color="#34D399" />
                      <Text style={styles.completedText}>
                        {completedCount >= SESSION_AFFIRMATION_COUNT
                          ? "Session Complete!"
                          : "Great job!"}
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.affirmationCounter}>
                        {currentIndex + 1} of {SESSION_AFFIRMATION_COUNT}
                      </Text>
                      <AffirmationHighlightText
                        tokens={displayTokens}
                        activeToken={activeToken}
                        style={styles.promptText}
                        spokenStyle={styles.promptSpoken}
                        currentStyle={styles.promptCurrent}
                        pendingStyle={styles.promptPending}
                        showQuotes
                      />
                      {isListening && (
                        <View style={styles.listeningIndicator}>
                          <Ionicons name="mic" size={16} color="#A7F3D0" />
                          <Text style={styles.listeningBadge}>Listening...</Text>
                        </View>
                      )}
                      {speechError && (
                        <Text style={styles.speechNote}>Speech recognition error</Text>
                      )}
                    </>
                  )}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Ionicons name="camera" size={48} color="#94A3B8" />
              <Text style={styles.placeholderTitle}>Ready for Your Mirror Session?</Text>
              <Text style={styles.placeholderSubtitle}>
                Speak {SESSION_AFFIRMATION_COUNT} affirmations while looking at yourself in the mirror.
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
            <Text style={styles.progressText}>
              {completedCount} of {SESSION_AFFIRMATION_COUNT} affirmations
            </Text>
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
  sessionHeader: { alignItems: 'center', paddingHorizontal: 16, marginTop: 12 },
  sessionTitle: { color: '#fff', fontSize: 26, fontWeight: '700' },
  sessionSubtitle: { color: '#CBD5F5', marginTop: 6, fontSize: 14 },
  highlightText: { color: '#C084FC', fontWeight: '600' },
  cameraContainer: { flex: 1, padding: 16 },
  cameraWrapper: { flex: 1, borderRadius: 28, overflow: 'hidden' },
  cameraView: { flex: 1 },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  noCameraOverlay: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 28,
    position: 'relative',
  },
  promptCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    minWidth: 280,
  },
  affirmationCounter: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 12,
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
    marginTop: 16,
    gap: 6,
  },
  listeningBadge: { color: '#A7F3D0', fontSize: 14 },
  speechNote: { color: '#FCA5A5', fontSize: 12, textAlign: 'center', marginTop: 12 },
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
