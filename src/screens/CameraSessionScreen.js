import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, PrimaryButton, GhostButton, IconButton } from '../components/common';
import { AffirmationHighlightText } from '../components/affirmation';
import { PROMPTS } from '../constants';
import { useStats } from '../hooks/useStats';
import { useSpeechMatcher } from '../hooks/useSpeechMatcher';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { storageService } from '../services/storage';
import { formatTime } from '../utils/dateUtils';

export const CameraSessionScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [completedPrompts, setCompletedPrompts] = useState([]);
  const [sessionTime, setSessionTime] = useState(0);
  const [feeling, setFeeling] = useState('');
  const [speechNote, setSpeechNote] = useState('');
  const { recordSession } = useStats();
  const promptText = PROMPTS[currentPromptIndex];
  const { displayTokens, activeToken, updateWithSpeech } = useSpeechMatcher(promptText);
  const {
    isListening,
    partial,
    finalText,
    error: speechError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  useEffect(() => {
    storageService.getCurrentFeeling().then((value) => {
      if (value) setFeeling(value);
    });
  }, []);

  useEffect(() => {
    if (partial) updateWithSpeech(partial);
  }, [partial, updateWithSpeech]);

  useEffect(() => {
    if (finalText) updateWithSpeech(finalText);
  }, [finalText, updateWithSpeech]);

  useEffect(() => {
    if (speechError) setSpeechNote('Speech recognition error. Try again.');
  }, [speechError]);

  useEffect(() => {
    let interval;
    if (cameraEnabled) {
      interval = setInterval(() => setSessionTime((prev) => prev + 1), 1000);
    }
    return () => interval && clearInterval(interval);
  }, [cameraEnabled]);

  const startCamera = async () => {
    const status = permission?.status;
    if (status !== 'granted') {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setCameraEnabled(true);
  };

  const stopCamera = () => {
    setCameraEnabled(false);
  };

  const markComplete = () => {
    if (!completedPrompts.includes(currentPromptIndex)) {
      setCompletedPrompts((prev) => [...prev, currentPromptIndex]);
    }
  };

  const nextPrompt = () => {
    if (currentPromptIndex < PROMPTS.length - 1) {
      setCurrentPromptIndex((prev) => prev + 1);
    }
  };

  const prevPrompt = () => {
    if (currentPromptIndex > 0) {
      setCurrentPromptIndex((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    await recordSession({
      feeling,
      completedPrompts: completedPrompts.length,
      duration: sessionTime,
    });
    stopCamera();
    navigation.navigate('Reflection');
  };

  const progress = (completedPrompts.length / PROMPTS.length) * 100;
  const speechStatus = !isSpeechSupported
    ? 'Speech recognition unavailable'
    : isListening
      ? 'Listening for your affirmation...'
      : 'Tap the mic to start speaking';

  const toggleListening = async () => {
    if (isListening) {
      await stopListening();
      return;
    }

    if (!isSpeechSupported) {
      setSpeechNote('Speech recognition is not configured for this device yet.');
      return;
    }

    setSpeechNote('');
    await startListening({ language: 'en-US' });
  };

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
          {cameraEnabled ? (
            <View style={styles.cameraWrapper}>
              <CameraView style={styles.cameraView} facing="front" />
              <View style={styles.cameraOverlay}>
                <View style={styles.promptCard}>
                  <AffirmationHighlightText
                    tokens={displayTokens}
                    activeToken={activeToken}
                    style={styles.promptText}
                    spokenStyle={styles.promptSpoken}
                    currentStyle={styles.promptCurrent}
                    pendingStyle={styles.promptPending}
                    showQuotes
                  />
                  {speechNote ? <Text style={styles.speechNote}>{speechNote}</Text> : null}
                  {isListening ? <Text style={styles.listeningBadge}>Listening...</Text> : null}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Ionicons name="camera" size={48} color="#94A3B8" />
              <Text style={styles.placeholderTitle}>Ready for Your Mirror Session?</Text>
              <Text style={styles.placeholderSubtitle}>
                Enable your camera to see yourself while saying affirmations, or continue without it.
              </Text>
              <View style={styles.placeholderButtons}>
                <PrimaryButton title="Enable Camera" icon="camera" onPress={startCamera} />
                <GhostButton title="Skip Camera" onPress={() => setCameraEnabled(false)} />
              </View>
            </View>
          )}
        </View>

        <View style={styles.progressWrap}>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              {completedPrompts.length} of {PROMPTS.length} affirmations
            </Text>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <View style={styles.speechRow}>
          <Text style={styles.speechStatusText}>{speechStatus}</Text>
          <IconButton icon={isListening ? 'mic-off' : 'mic'} onPress={toggleListening} active={isListening} />
        </View>

        <View style={styles.controlRow}>
          <GhostButton title="Previous" onPress={prevPrompt} />
          <PrimaryButton
            title={completedPrompts.includes(currentPromptIndex) ? 'Done' : 'Complete'}
            icon={completedPrompts.includes(currentPromptIndex) ? 'checkmark' : 'sparkles'}
            onPress={markComplete}
          />
          <GhostButton title="Next" onPress={nextPrompt} />
        </View>

        <View style={styles.rowButtons}>
          <GhostButton
            title="Exit Session"
            onPress={() => {
              stopCamera();
              navigation.navigate('Feelings');
            }}
          />
          <PrimaryButton title="Complete Session" onPress={handleComplete} />
        </View>
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
  promptCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  promptText: { color: '#fff', fontSize: 22, textAlign: 'center', lineHeight: 30 },
  promptSpoken: { color: '#34D399' },
  promptCurrent: { color: '#C084FC', fontWeight: '700' },
  promptPending: { color: '#E2E8F0' },
  speechNote: { color: '#FCA5A5', fontSize: 12, textAlign: 'center', marginTop: 8 },
  listeningBadge: { color: '#A7F3D0', fontSize: 12, textAlign: 'center', marginTop: 6 },
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
  speechRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  speechStatusText: { color: '#CBD5F5', fontSize: 12, flex: 1, marginRight: 12 },
  controlRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 12 },
  rowButtons: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingBottom: 16, marginTop: 12 },
});
