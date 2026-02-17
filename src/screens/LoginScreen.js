import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { authService } from '../services/auth';
import { PrimaryButton } from '../components/common';
import { useColors } from '../hooks/useColors';
import { typography } from '../styles/typography';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null); // 'apple' | 'google' | 'email'
  const [emailExpanded, setEmailExpanded] = useState(false);
  const { updatePreferences, completeOnboarding } = useApp();
  const c = useColors();

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setLoadingProvider('apple');
    try {
      const { user } = await authService.signInWithApple();
      const userName = user?.user_metadata?.name || 'Friend';
      await updatePreferences({ userName });
      await completeOnboarding();
      navigation.replace('WelcomeBack', { userName });
    } catch (error) {
      // Apple auth canceled — don't show error
      if (error.code !== 'ERR_REQUEST_CANCELED' && error.code !== 'ERR_CANCELED') {
        Alert.alert('Sign In Error', error.message);
      }
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setLoadingProvider('google');
    try {
      const { user } = await authService.signInWithGoogle();
      const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || 'Friend';
      await updatePreferences({ userName });
      await completeOnboarding();
      navigation.replace('WelcomeBack', { userName });
    } catch (error) {
      if (error.code !== 'ERR_SIGN_IN_CANCELLED' && error.code !== 'SIGN_IN_CANCELLED') {
        Alert.alert('Sign In Error', error.message);
      }
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email.trim() || !password.trim()) return;

    Keyboard.dismiss();
    setIsLoading(true);
    setLoadingProvider('email');

    try {
      const { user } = await authService.signIn({
        email: email.trim(),
        password: password.trim(),
      });
      const userName = user?.user_metadata?.name || 'Friend';
      await updatePreferences({ userName });
      await completeOnboarding();
      navigation.replace('WelcomeBack', { userName });
    } catch (error) {
      Alert.alert('Sign In Error', error.message);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const toggleEmailSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEmailExpanded(!emailExpanded);
  };

  const handleBack = () => {
    Keyboard.dismiss();
    navigation.goBack();
  };

  const isEmailDisabled = isLoading || !email.trim() || !password.trim();

  return (
    <View style={[styles.background, { backgroundColor: c.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar barStyle={c.statusBarStyle} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={0}
        >
          {/* Back Button */}
          <View style={styles.headerRow}>
            <Pressable
              onPress={handleBack}
              style={[styles.backButton, { backgroundColor: c.surfaceSecondary }]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={20} color={c.textSecondary} />
            </Pressable>
          </View>

          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Brand */}
              <View style={styles.brandSection}>
                <Text style={[styles.brandTitle, { color: c.textPrimary }]}>
                  Mirrorcle
                </Text>
                <Text style={[styles.brandSubtitle, { color: c.textSecondary }]}>
                  Welcome back to your practice
                </Text>
              </View>

              {/* Social Auth Buttons */}
              <View style={styles.socialSection}>
                {/* Apple Sign In — iOS only */}
                {Platform.OS === 'ios' && (
                  <Pressable
                    onPress={handleAppleSignIn}
                    disabled={isLoading}
                    style={({ pressed }) => [
                      styles.socialButton,
                      styles.appleButton,
                      pressed && styles.socialButtonPressed,
                      isLoading && styles.socialButtonDisabled,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Continue with Apple"
                  >
                    {loadingProvider === 'apple' ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                        <Text style={styles.appleButtonText}>Continue with Apple</Text>
                      </>
                    )}
                  </Pressable>
                )}

                {/* Google Sign In */}
                <Pressable
                  onPress={handleGoogleSignIn}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    styles.socialButton,
                    styles.googleButton,
                    { backgroundColor: c.surface, borderColor: c.border },
                    pressed && styles.socialButtonPressed,
                    isLoading && styles.socialButtonDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Continue with Google"
                >
                  {loadingProvider === 'google' ? (
                    <ActivityIndicator size="small" color={c.textPrimary} />
                  ) : (
                    <>
                      <Ionicons name="logo-google" size={18} color={c.textPrimary} />
                      <Text style={[styles.googleButtonText, { color: c.textPrimary }]}>
                        Continue with Google
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>

              {/* Divider */}
              <Pressable onPress={toggleEmailSection} style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
                <Text style={[styles.dividerText, { color: c.textMuted }]}>
                  or sign in with email
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
              </Pressable>

              {/* Email Form — Collapsible */}
              {emailExpanded && (
                <View style={styles.formContainer}>
                  <View style={[styles.inputWrapper, { backgroundColor: c.inputBackground, borderColor: c.inputBorder }]}>
                    <Ionicons name="mail-outline" size={20} color={c.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: c.textPrimary }]}
                      placeholder="Email address"
                      placeholderTextColor={c.inputPlaceholder}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      returnKeyType="next"
                      autoFocus
                    />
                  </View>

                  <View style={[styles.inputWrapper, { backgroundColor: c.inputBackground, borderColor: c.inputBorder }]}>
                    <Ionicons name="lock-closed-outline" size={20} color={c.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: c.textPrimary }]}
                      placeholder="Password"
                      placeholderTextColor={c.inputPlaceholder}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleEmailSignIn}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={c.textMuted}
                      />
                    </Pressable>
                  </View>

                  <Pressable
                    style={styles.forgotPassword}
                    onPress={() => navigation.navigate('ForgotPassword')}
                  >
                    <Text style={[styles.forgotPasswordText, { color: c.accentRust }]}>
                      Forgot password?
                    </Text>
                  </Pressable>

                  <PrimaryButton
                    title={loadingProvider === 'email' ? 'Signing in...' : 'Sign In'}
                    onPress={handleEmailSignIn}
                    disabled={isEmailDisabled}
                  />
                </View>
              )}

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: c.textSecondary }]}>
                  New here?{' '}
                </Text>
                <Pressable onPress={() => navigation.navigate('CreateAccount')}>
                  <Text style={[styles.footerLink, { color: c.accentRust }]}>
                    Begin your journey
                  </Text>
                </Pressable>
              </View>
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
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 24,
  },

  // Brand
  brandSection: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  brandTitle: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: typography.fontSize.brand,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  brandSubtitle: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: 17,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 26,
  },

  // Social Auth
  socialSection: {
    gap: 12,
    marginBottom: 28,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    gap: 10,
  },
  socialButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  socialButtonDisabled: {
    opacity: 0.7,
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  googleButton: {
    borderWidth: 1,
  },
  googleButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    marginHorizontal: 16,
  },

  // Email Form
  formContainer: {
    gap: 14,
    marginBottom: 24,
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
    fontSize: 17,
    paddingVertical: 16,
  },
  eyeButton: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
