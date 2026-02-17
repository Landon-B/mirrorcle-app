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
import { useApp } from '../context/AppContext';
import { authService } from '../services/auth';
import { useColors } from '../hooks/useColors';
import { useGradients } from '../hooks/useColors';

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
  const c = useColors();
  const g = useGradients();

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
      navigation.replace('MainTabs');
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
            <View style={[styles.inputWrapper, { backgroundColor: c.inputBackground, borderColor: c.inputBorder }]}>
              <Ionicons name="person-outline" size={22} color={c.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: c.textPrimary }]}
                placeholder="Enter your name"
                placeholderTextColor={c.inputPlaceholder}
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
            <View style={[styles.inputWrapper, { backgroundColor: c.inputBackground, borderColor: c.inputBorder }]}>
              <Ionicons name="mail-outline" size={22} color={c.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: c.textPrimary }]}
                placeholder="Email address"
                placeholderTextColor={c.inputPlaceholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
                returnKeyType="next"
              />
            </View>
            <View style={[styles.inputWrapper, { backgroundColor: c.inputBackground, borderColor: c.inputBorder }]}>
              <Ionicons name="lock-closed-outline" size={22} color={c.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: c.textPrimary }]}
                placeholder="Create password"
                placeholderTextColor={c.inputPlaceholder}
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
            <Text style={[styles.otpHint, { color: c.textSecondary }]}>We sent a code to {email}</Text>
            <View style={[styles.inputWrapper, { backgroundColor: c.inputBackground, borderColor: c.inputBorder }]}>
              <Ionicons name="keypad-outline" size={22} color={c.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.otpInput, { color: c.textPrimary }]}
                placeholder="00000000"
                placeholderTextColor={c.inputPlaceholder}
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
              <Text style={[styles.resendText, { color: c.accentRust }]}>Didn't receive a code? Resend</Text>
            </Pressable>
          </View>
        );
      case 3:
        return (
          <View style={styles.successContainer}>
            <LinearGradient
              colors={g.success}
              style={styles.successIcon}
            >
              <Ionicons name="checkmark" size={48} color="#fff" />
            </LinearGradient>
            <Text style={[styles.welcomeText, { color: c.textPrimary }]}>Welcome, {name}!</Text>
            <Text style={[styles.welcomeSubtext, { color: c.textSecondary }]}>
              Your journey to self-discovery and growth starts now. We're honored to be part of it.
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.background, { backgroundColor: c.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle={c.statusBarStyle} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={0}
        >
          {/* Fixed Header with Navigation */}
          <View style={[styles.header, { borderBottomColor: c.border }]}>
            <Pressable onPress={handleBack} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color={c.textPrimary} />
              <Text style={[styles.headerButtonText, { color: c.textPrimary }]}>Back</Text>
            </Pressable>

            <View style={styles.progressDots}>
              {STEPS.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    { backgroundColor: c.border },
                    idx === step && [styles.dotActive, { backgroundColor: c.accentRust }],
                    idx < step && { backgroundColor: c.success },
                  ]}
                />
              ))}
            </View>

            <Pressable
              onPress={handleNext}
              style={[styles.headerButton, styles.headerButtonRight, isNextDisabled() && styles.headerButtonDisabled]}
              disabled={isNextDisabled()}
            >
              <Text style={[styles.headerButtonText, styles.headerButtonTextRight, { color: c.accentRust }, isNextDisabled() && { color: c.disabled }]}>
                {isLoading ? (step === 2 ? 'Verifying...' : 'Creating...') : getNextButtonText()}
              </Text>
              {isLoading ? (
                <ActivityIndicator size="small" color={c.accentRust} />
              ) : (
                <Ionicons
                  name={step === STEPS.length - 1 ? "sparkles" : "arrow-forward"}
                  size={20}
                  color={isNextDisabled() ? c.disabled : c.accentRust}
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
                <View style={[styles.quoteCard, { backgroundColor: c.surface }]}>
                  <Ionicons name="chatbubble-ellipses" size={24} color={c.accentRust} style={styles.quoteIcon} />
                  <Text style={[styles.quoteText, { color: c.textPrimary }]}>"{currentStep.quote}"</Text>
                  <Text style={[styles.quoteAuthor, { color: c.textSecondary }]}>— {currentStep.author}</Text>
                </View>

                {/* Step content */}
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: c.textPrimary }]}>{currentStep.title}</Text>
                  <Text style={[styles.stepSubtitle, { color: c.textSecondary }]}>{currentStep.subtitle}</Text>
                  {renderStepContent()}
                </View>
              </Animated.View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
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
    fontSize: 16,
    marginLeft: 6,
  },
  headerButtonTextRight: {
    fontWeight: '600',
    marginLeft: 0,
    marginRight: 6,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  content: {
    flex: 1,
  },
  quoteCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  quoteIcon: {
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    lineHeight: 28,
  },
  quoteAuthor: {
    fontSize: 14,
    marginTop: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  inputContainer: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
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
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  resendButton: {
    alignSelf: 'center',
    paddingVertical: 12,
  },
  resendText: {
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
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  welcomeSubtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
});
