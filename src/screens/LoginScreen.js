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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '../components/common';
import { useApp } from '../context/AppContext';
import { authService } from '../services/auth';

const QUOTES = [
  {
    text: "Every morning brings new potential, but if you dwell on the misfortunes of the day before, you tend to overlook tremendous opportunities.",
    author: "Harvey Mackay",
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
  },
];

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { updatePreferences, completeOnboarding } = useApp();

  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;

    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const { user } = await authService.signIn({
        email: email.trim(),
        password: password.trim(),
      });
      const userName = user?.user_metadata?.name || 'Friend';
      await updatePreferences({ userName });
      await completeOnboarding();
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Sign In Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    Keyboard.dismiss();
    navigation.goBack();
  };

  const isLoginDisabled = isLoading || !email.trim() || !password.trim();

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

            <Pressable
              onPress={handleLogin}
              style={[styles.headerButton, styles.headerButtonRight, isLoginDisabled && styles.headerButtonDisabled]}
              disabled={isLoginDisabled}
            >
              <Text style={[styles.headerButtonText, styles.headerButtonTextRight, isLoginDisabled && styles.headerButtonTextDisabled]}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Text>
              {isLoading ? (
                <ActivityIndicator size="small" color="#C084FC" />
              ) : (
                <Ionicons
                  name="log-in-outline"
                  size={20}
                  color={isLoginDisabled ? "#64748B" : "#C084FC"}
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
              <View style={styles.headerContent}>
                <LinearGradient
                  colors={['#A855F7', '#EC4899']}
                  style={styles.iconContainer}
                >
                  <Ionicons name="sparkles" size={32} color="#fff" />
                </LinearGradient>
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Continue your journey of self-discovery</Text>
              </View>

              <View style={styles.quoteCard}>
                <Text style={styles.quoteText}>"{randomQuote.text}"</Text>
                <Text style={styles.quoteAuthor}>— {randomQuote.author}</Text>
              </View>

              <View style={styles.formContainer}>
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
                    autoComplete="email"
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={22} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#64748B"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#94A3B8"
                    />
                  </Pressable>
                </View>

                <Pressable style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </Pressable>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <Pressable onPress={() => navigation.navigate('CreateAccount')}>
                  <Text style={styles.footerLink}>Sign up</Text>
                </Pressable>
              </View>
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#CBD5F5',
    textAlign: 'center',
  },
  quoteCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  quoteText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
  },
  quoteAuthor: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  formContainer: {
    gap: 16,
    marginBottom: 24,
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
  eyeButton: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: '#C084FC',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: 24,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  footerLink: {
    color: '#C084FC',
    fontSize: 14,
    fontWeight: '600',
  },
});
