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
  ScrollView,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '../components/common';
import { useApp } from '../context/AppContext';
import { authService } from '../services/auth';

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
    quote: "Trust the process. Every step forward is progress.",
    author: "Unknown",
    title: "Verify your email",
    subtitle: "Enter the 8-digit code we sent you",
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
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    if (step === 2 && otpCode.length !== 8) return;

    Keyboard.dismiss();

    if (step === 1) {
      // Create account with Supabase
      setIsLoading(true);
      try {
        await authService.signUp({
          email: email.trim(),
          password: password.trim(),
          name: name.trim(),
        });
        await updatePreferences({ userName: name.trim() });
        animateTransition(() => setStep(step + 1));
      } catch (error) {
        Alert.alert('Sign Up Error', error.message);
      } finally {
        setIsLoading(false);
      }
    } else if (step === 2) {
      // Verify OTP code
      setIsLoading(true);
      try {
        await authService.verifyOtp({
          email: email.trim(),
          token: otpCode.trim(),
        });
        animateTransition(() => setStep(step + 1));
      } catch (error) {
        Alert.alert('Verification Error', error.message);
      } finally {
        setIsLoading(false);
      }
    } else if (step < STEPS.length - 1) {
      animateTransition(() => setStep(step + 1));
    } else {
      await completeOnboarding();
      navigation.replace('Home');
    }
  };

  const handleBack = () => {
    Keyboard.dismiss();
    if (step > 0) {
      animateTransition(() => setStep(step - 1));
    } else {
      navigation.goBack();
    }
  };

  const isNextDisabled = () => {
    if (isLoading) return true;
    if (step === 0) return !name.trim();
    if (step === 1) return !email.trim() || !password.trim();
    if (step === 2) return otpCode.length !== 8;
    return false;
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      await authService.resendOtp({ email: email.trim() });
      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getNextButtonText = () => {
    if (step === STEPS.length - 1) return "Start";
    if (step === 2) return "Verify";
    return "Next";
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
                returnKeyType="next"
                onSubmitEditing={handleNext}
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
                autoFocus
                returnKeyType="next"
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
                returnKeyType="done"
                onSubmitEditing={handleNext}
              />
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.otpHint}>We sent a code to {email}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="keypad-outline" size={22} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="00000000"
                placeholderTextColor="#64748B"
                value={otpCode}
                onChangeText={(text) => setOtpCode(text.replace(/[^0-9]/g, '').slice(0, 8))}
                keyboardType="number-pad"
                autoFocus
                maxLength={8}
                returnKeyType="done"
                onSubmitEditing={handleNext}
              />
            </View>
            <Pressable onPress={handleResendCode} disabled={isLoading} style={styles.resendButton}>
              <Text style={styles.resendText}>Didn't receive a code? Resend</Text>
            </Pressable>
          </View>
        );
      case 3:
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

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={0}
        >
          {/* Fixed Header with Navigation */}
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
              <Text style={styles.headerButtonText}>Back</Text>
            </Pressable>

            <View style={styles.progressDots}>
              {STEPS.map((_, idx) => (
                <View
                  key={idx}
                  style={[styles.dot, idx === step && styles.dotActive, idx < step && styles.dotCompleted]}
                />
              ))}
            </View>

            <Pressable
              onPress={handleNext}
              style={[styles.headerButton, styles.headerButtonRight, isNextDisabled() && styles.headerButtonDisabled]}
              disabled={isNextDisabled()}
            >
              <Text style={[styles.headerButtonText, styles.headerButtonTextRight, isNextDisabled() && styles.headerButtonTextDisabled]}>
                {isLoading ? (step === 2 ? 'Verifying...' : 'Creating...') : getNextButtonText()}
              </Text>
              {isLoading ? (
                <ActivityIndicator size="small" color="#C084FC" />
              ) : (
                <Ionicons
                  name={step === STEPS.length - 1 ? "sparkles" : "arrow-forward"}
                  size={20}
                  color={isNextDisabled() ? "#64748B" : "#C084FC"}
                />
              )}
            </Pressable>
          </View>

          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
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
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(71, 85, 105, 0.3)',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 80,
  },
  headerButtonRight: {
    justifyContent: 'flex-end',
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 6,
  },
  headerButtonTextRight: {
    color: '#C084FC',
    fontWeight: '600',
    marginLeft: 0,
    marginRight: 6,
  },
  headerButtonTextDisabled: {
    color: '#64748B',
  },
  progressDots: {
    flexDirection: 'row',
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
  dotCompleted: {
    backgroundColor: '#22C55E',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
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
  otpInput: {
    letterSpacing: 6,
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  otpHint: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  resendButton: {
    alignSelf: 'center',
    paddingVertical: 12,
  },
  resendText: {
    color: '#C084FC',
    fontSize: 14,
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
});
