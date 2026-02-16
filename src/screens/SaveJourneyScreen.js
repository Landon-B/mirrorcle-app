import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { PrimaryButton } from '../components/common';
import { typography } from '../styles/typography';
import { colors } from '../styles/colors';
import { spacing, borderRadius } from '../styles/spacing';
import { useHaptics } from '../hooks/useHaptics';
import { useApp } from '../context/AppContext';
import { authService } from '../services/auth';

// Steps: name → credentials → verify → welcome
const STEPS = { NAME: 0, CREDENTIALS: 1, VERIFY: 2, WELCOME: 3 };

export const SaveJourneyScreen = ({ navigation, route }) => {
  const { completeOnboarding, updatePreferences } = useApp();
  const { selectionTap, successPulse, celebrationBurst } = useHaptics();

  const [step, setStep] = useState(STEPS.NAME);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  // Progress dots animation
  const dotScale = useSharedValue(1);

  useEffect(() => {
    dotScale.value = withSpring(1.2, { damping: 8 });
    setTimeout(() => {
      dotScale.value = withSpring(1, { damping: 8 });
    }, 200);
  }, [step]);

  // Sparkle breathing for welcome step
  const sparkleScale = useSharedValue(0);

  useEffect(() => {
    if (step === STEPS.WELCOME) {
      celebrationBurst();
      sparkleScale.value = withSpring(1, { damping: 10, stiffness: 120, mass: 0.5 });
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
    }
  }, [step]);

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sparkleScale.value }],
  }));

  // --- Handlers ---

  const handleNameNext = () => {
    if (!name.trim()) return;
    selectionTap();
    setStep(STEPS.CREDENTIALS);
  };

  const handleCredentialsNext = async () => {
    if (!email.trim() || !password.trim()) return;
    if (password.length < 6) {
      Alert.alert('Password too short', 'Please use at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await authService.signUp({
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
      });
      await updatePreferences({ userName: name.trim() });
      selectionTap();
      setStep(STEPS.VERIFY);
    } catch (error) {
      Alert.alert('Sign up failed', error.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const cleanOtp = otp.replace(/\s/g, '');
    if (cleanOtp.length !== 8) return;

    setLoading(true);
    try {
      await authService.verifyOtp({
        email: email.trim().toLowerCase(),
        token: cleanOtp,
      });
      successPulse();
      setStep(STEPS.WELCOME);
    } catch (error) {
      Alert.alert('Verification failed', error.message || 'Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await authService.resendOtp({ email: email.trim().toLowerCase() });
      Alert.alert('Code resent', 'Check your email for a new code.');
    } catch (error) {
      Alert.alert('Resend failed', error.message || 'Please try again.');
    }
  };

  const handleFinish = async () => {
    await completeOnboarding();
    navigation.replace('MainTabs');
  };

  const handleSkip = async () => {
    await completeOnboarding();
    navigation.replace('MainTabs');
  };

  // Format OTP with space in middle (1234 5678)
  const formatOtp = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    if (digits.length > 4) {
      return digits.slice(0, 4) + ' ' + digits.slice(4);
    }
    return digits;
  };

  // --- Render Steps ---

  const renderProgressDots = () => {
    // Don't show on welcome step
    if (step === STEPS.WELCOME) return null;

    return (
      <View style={styles.progressRow}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i <= step ? styles.progressDotActive : styles.progressDotInactive,
              i === step && styles.progressDotCurrent,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderNameStep = () => (
    <Animated.View
      key="name"
      entering={FadeInDown.duration(400)}
      exiting={FadeOut.duration(200)}
      style={styles.stepContent}
    >
      <View style={styles.iconCircle}>
        <Ionicons name="person-outline" size={32} color={colors.textAccent} />
      </View>

      <Text style={styles.stepTitle}>What should we{'\n'}call you?</Text>
      <Text style={styles.stepSubtitle}>
        This is how we'll address your affirmations.
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.nameInput}
          placeholder="Your name"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          autoFocus
          autoCapitalize="words"
          returnKeyType="next"
          onSubmitEditing={handleNameNext}
        />
        <View style={styles.inputUnderline} />
      </View>

      <Text style={styles.helperText}>You can change this later in settings.</Text>
    </Animated.View>
  );

  const renderCredentialsStep = () => (
    <Animated.View
      key="credentials"
      entering={FadeInDown.duration(400)}
      exiting={FadeOut.duration(200)}
      style={styles.stepContent}
    >
      <View style={styles.iconCircle}>
        <Ionicons name="shield-checkmark-outline" size={32} color={colors.textAccent} />
      </View>

      <Text style={styles.stepTitle}>Protect your{'\n'}journey</Text>
      <Text style={styles.stepSubtitle}>
        So you never lose a moment of growth.
      </Text>

      <View style={styles.fieldsContainer}>
        <View style={styles.fieldWrapper}>
          <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.fieldIcon} />
          <TextInput
            ref={emailRef}
            style={styles.fieldInput}
            placeholder="Email address"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            autoFocus
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
        </View>

        <View style={styles.fieldWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.fieldIcon} />
          <TextInput
            ref={passwordRef}
            style={[styles.fieldInput, { flex: 1 }]}
            placeholder="Create a password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            returnKeyType="done"
            onSubmitEditing={handleCredentialsNext}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={12}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );

  const renderVerifyStep = () => (
    <Animated.View
      key="verify"
      entering={FadeInDown.duration(400)}
      exiting={FadeOut.duration(200)}
      style={styles.stepContent}
    >
      <View style={styles.iconCircle}>
        <Ionicons name="keypad-outline" size={32} color={colors.textAccent} />
      </View>

      <Text style={styles.stepTitle}>Check your email</Text>
      <Text style={styles.stepSubtitle}>
        We sent a verification code to{'\n'}
        <Text style={styles.emailHighlight}>{email.trim().toLowerCase()}</Text>
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.otpInput}
          placeholder="0000 0000"
          placeholderTextColor={colors.textMuted}
          value={otp}
          onChangeText={(text) => setOtp(formatOtp(text))}
          keyboardType="number-pad"
          autoFocus
          maxLength={9}
          returnKeyType="done"
          onSubmitEditing={handleVerify}
        />
        <View style={styles.inputUnderline} />
      </View>

      <Pressable onPress={handleResendOtp} hitSlop={12}>
        <Text style={styles.resendText}>Didn't get it? Resend code</Text>
      </Pressable>
    </Animated.View>
  );

  const renderWelcomeStep = () => (
    <Animated.View
      key="welcome"
      entering={FadeIn.duration(600)}
      style={styles.welcomeContent}
    >
      <Animated.View style={[styles.sparkleCircle, sparkleAnimatedStyle]}>
        <Ionicons name="sparkles" size={36} color={colors.textAccent} />
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(300).duration(500)}
        style={styles.welcomeTitle}
      >
        Welcome, {name.trim()}.
      </Animated.Text>

      <Animated.Text
        entering={FadeInDown.delay(500).duration(500)}
        style={styles.welcomeSubtitle}
      >
        Your journey has already begun.{'\n'}Every session will be saved.
      </Animated.Text>
    </Animated.View>
  );

  // --- Main Button ---

  const getButtonConfig = () => {
    switch (step) {
      case STEPS.NAME:
        return { title: 'Next', icon: 'arrow-forward', onPress: handleNameNext, disabled: !name.trim() };
      case STEPS.CREDENTIALS:
        return { title: 'Create Account', icon: 'arrow-forward', onPress: handleCredentialsNext, disabled: !email.trim() || !password.trim() || loading };
      case STEPS.VERIFY:
        return { title: 'Verify', icon: 'checkmark', onPress: handleVerify, disabled: otp.replace(/\s/g, '').length !== 8 || loading };
      case STEPS.WELCOME:
        return { title: "Let's Begin", icon: 'arrow-forward', onPress: handleFinish, disabled: false };
      default:
        return {};
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          {step > STEPS.NAME && step < STEPS.WELCOME && (
            <Pressable
              onPress={() => setStep(step - 1)}
              style={styles.backButton}
              hitSlop={12}
            >
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </Pressable>
          )}
          {renderProgressDots()}
        </View>

        {/* Step Content */}
        <View style={styles.body}>
          {step === STEPS.NAME && renderNameStep()}
          {step === STEPS.CREDENTIALS && renderCredentialsStep()}
          {step === STEPS.VERIFY && renderVerifyStep()}
          {step === STEPS.WELCOME && renderWelcomeStep()}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {loading && (
            <ActivityIndicator color={colors.textAccent} style={styles.loadingIndicator} />
          )}

          <PrimaryButton
            title={buttonConfig.title}
            icon={buttonConfig.icon}
            onPress={buttonConfig.onPress}
            disabled={buttonConfig.disabled || loading}
          />

          {step !== STEPS.WELCOME && (
            <Pressable onPress={handleSkip} style={styles.skipButton} hitSlop={12}>
              <Text style={styles.skipText}>I'll do this later</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    minHeight: 48,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: spacing.xl,
    zIndex: 1,
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  progressDot: {
    height: 6,
    borderRadius: 3,
  },
  progressDotActive: {
    width: 24,
    backgroundColor: colors.textAccent,
  },
  progressDotInactive: {
    width: 24,
    backgroundColor: colors.border,
  },
  progressDotCurrent: {
    width: 32,
  },

  // Body
  body: {
    flex: 1,
    justifyContent: 'center',
  },

  // Steps shared
  stepContent: {
    paddingHorizontal: spacing.xxxl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentPeach,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  stepTitle: {
    fontSize: typography.fontSize.title,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: spacing.md,
  },
  stepSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xxxl,
  },

  // Name input
  inputContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  nameInput: {
    fontSize: typography.fontSize.xl,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingVertical: spacing.md,
    fontWeight: typography.fontWeight.medium,
  },
  inputUnderline: {
    height: 2,
    backgroundColor: colors.textAccent,
    borderRadius: 1,
    marginHorizontal: spacing.xxxxl,
  },
  helperText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Credentials fields
  fieldsContainer: {
    width: '100%',
    gap: spacing.lg,
  },
  fieldWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? spacing.lg : spacing.md,
  },
  fieldIcon: {
    marginRight: spacing.md,
  },
  fieldInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },

  // OTP
  otpInput: {
    fontSize: 32,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingVertical: spacing.md,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 4,
  },
  emailHighlight: {
    color: colors.textAccent,
    fontWeight: typography.fontWeight.medium,
  },
  resendText: {
    fontSize: typography.fontSize.md,
    color: colors.textAccent,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },

  // Welcome
  welcomeContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  sparkleCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accentPeach,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxxl,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: spacing.md,
  },
  welcomeSubtitle: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 17,
    fontStyle: 'italic',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },

  // Footer
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  loadingIndicator: {
    marginBottom: spacing.md,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  skipText: {
    fontSize: typography.fontSize.md,
    color: colors.textMuted,
    fontWeight: typography.fontWeight.medium,
  },
});
