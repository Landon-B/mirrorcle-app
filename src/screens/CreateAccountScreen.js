import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, PrimaryButton, GhostButton } from '../components/common';
import { useApp } from '../context/AppContext';

const STEPS = [
  {
    quote: "Your journey of self-love begins with a single step.",
    author: "Unknown",
    title: "What should we call you?",
    subtitle: "This is how we'll greet you each day",
  },
  {
    quote: "You are not a drop in the ocean. You are the entire ocean in a drop.",
    author: "Rumi",
    title: "Create your account",
    subtitle: "We'll keep your progress safe",
  },
  {
    quote: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
    title: "You're all set!",
    subtitle: "Let's begin your transformation",
  },
];

export const CreateAccountScreen = ({ navigation }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { updatePreferences, completeOnboarding } = useApp();

  const currentStep = STEPS[step];

  const animateTransition = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
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
  };

  const handleNext = async () => {
    if (step === 0 && !name.trim()) return;
    if (step === 1 && (!email.trim() || !password.trim())) return;

    if (step < STEPS.length - 1) {
      animateTransition(() => setStep(step + 1));
    } else {
      // Save user data and navigate to main app
      await updatePreferences({ userName: name.trim() });
      await completeOnboarding();
      navigation.replace('AffirmationHome');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      animateTransition(() => setStep(step - 1));
    } else {
      navigation.goBack();
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={22} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#64748B"
                value={name}
                onChangeText={setName}
                autoFocus
                autoCapitalize="words"
              />
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={22} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#64748B"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={22} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Create password"
                placeholderTextColor="#64748B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.successContainer}>
            <LinearGradient
              colors={['#22C55E', '#10B981']}
              style={styles.successIcon}
            >
              <Ionicons name="checkmark" size={48} color="#fff" />
            </LinearGradient>
            <Text style={styles.welcomeText}>Welcome, {name}!</Text>
            <Text style={styles.welcomeSubtext}>
              Your journey to self-discovery and growth starts now. We're honored to be part of it.
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    if (step === 0) return !name.trim();
    if (step === 1) return !email.trim() || !password.trim();
    return false;
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${((step + 1) / STEPS.length) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>Step {step + 1} of {STEPS.length}</Text>
          </View>

          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Quote card */}
            <View style={styles.quoteCard}>
              <Ionicons name="chatbubble-ellipses" size={24} color="#C084FC" style={styles.quoteIcon} />
              <Text style={styles.quoteText}>"{currentStep.quote}"</Text>
              <Text style={styles.quoteAuthor}>— {currentStep.author}</Text>
            </View>

            {/* Step content */}
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{currentStep.title}</Text>
              <Text style={styles.stepSubtitle}>{currentStep.subtitle}</Text>
              {renderStepContent()}
            </View>
          </Animated.View>

          {/* Buttons */}
          <View style={styles.buttonSection}>
            <PrimaryButton
              title={step === STEPS.length - 1 ? "Start My Journey" : "Continue"}
              icon={step === STEPS.length - 1 ? "sparkles" : "arrow-forward"}
              onPress={handleNext}
              disabled={isNextDisabled()}
            />
            <GhostButton
              title={step === 0 ? "Back" : "Go Back"}
              onPress={handleBack}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    padding: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A855F7',
    borderRadius: 2,
  },
  progressText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  quoteCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  quoteIcon: {
    marginBottom: 12,
  },
  quoteText: {
    color: '#fff',
    fontSize: 18,
    fontStyle: 'italic',
    lineHeight: 28,
  },
  quoteAuthor: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepSubtitle: {
    color: '#CBD5F5',
    fontSize: 16,
    marginBottom: 32,
  },
  inputContainer: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    paddingVertical: 18,
  },
  successContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  welcomeSubtext: {
    color: '#CBD5F5',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonSection: {
    gap: 12,
    marginTop: 20,
  },
});
