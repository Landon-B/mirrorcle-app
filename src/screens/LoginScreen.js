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
import { useApp } from '../context/AppContext';
import { authService } from '../services/auth';
import { useColors } from '../hooks/useColors';
import { useGradients } from '../hooks/useColors';

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
  const c = useColors();
  const g = useGradients();

  const [randomQuote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

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
      navigation.replace('MainTabs');
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

            <Pressable
              onPress={handleLogin}
              style={[styles.headerButton, styles.headerButtonRight, isLoginDisabled && styles.headerButtonDisabled]}
              disabled={isLoginDisabled}
            >
              <Text style={[styles.headerButtonText, styles.headerButtonTextRight, { color: c.accentRust }, isLoginDisabled && { color: c.disabled }]}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Text>
              {isLoading ? (
                <ActivityIndicator size="small" color={c.accentRust} />
              ) : (
                <Ionicons
                  name="log-in-outline"
                  size={20}
                  color={isLoginDisabled ? c.disabled : c.accentRust}
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
                  colors={g.primary}
                  style={styles.iconContainer}
                >
                  <Ionicons name="sparkles" size={32} color="#fff" />
                </LinearGradient>
                <Text style={[styles.title, { color: c.textPrimary }]}>Welcome back</Text>
                <Text style={[styles.subtitle, { color: c.textSecondary }]}>Continue your journey of self-discovery</Text>
              </View>

              <View style={[styles.quoteCard, { backgroundColor: c.surface }]}>
                <Text style={[styles.quoteText, { color: c.textPrimary }]}>"{randomQuote.text}"</Text>
                <Text style={[styles.quoteAuthor, { color: c.textSecondary }]}>— {randomQuote.author}</Text>
              </View>

              <View style={styles.formContainer}>
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
                    autoComplete="email"
                    returnKeyType="next"
                  />
                </View>

                <View style={[styles.inputWrapper, { backgroundColor: c.inputBackground, borderColor: c.inputBorder }]}>
                  <Ionicons name="lock-closed-outline" size={22} color={c.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: c.textPrimary }]}
                    placeholder="Password"
                    placeholderTextColor={c.inputPlaceholder}
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
                      color={c.textMuted}
                    />
                  </Pressable>
                </View>

                <Pressable style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={[styles.forgotPasswordText, { color: c.accentRust }]}>Forgot password?</Text>
                </Pressable>
              </View>

              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: c.textSecondary }]}>Don't have an account? </Text>
                <Pressable onPress={() => navigation.navigate('CreateAccount')}>
                  <Text style={[styles.footerLink, { color: c.accentRust }]}>Sign up</Text>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  quoteCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
  },
  quoteAuthor: {
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
  eyeButton: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 14,
  },
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
