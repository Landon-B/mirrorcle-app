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
    <View style={styles.background}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={0}
        >
          {/* Fixed Header with Navigation */}
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color="#2D2A26" />
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
                <ActivityIndicator size="small" color="#C17666" />
              ) : (
                <Ionicons
                  name="log-in-outline"
                  size={20}
                  color={isLoginDisabled ? "#D4CFC9" : "#C17666"}
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
                  colors={['#C17666', '#E8A090']}
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
                  <Ionicons name="mail-outline" size={22} color="#B0AAA2" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor="#B0AAA2"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={22} color="#B0AAA2" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#B0AAA2"
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
                      color="#B0AAA2"
                    />
                  </Pressable>
                </View>

                <Pressable style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#F5F2EE',
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
    borderBottomColor: '#E8E4DF',
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
    color: '#2D2A26',
    fontSize: 16,
    marginLeft: 6,
  },
  headerButtonTextRight: {
    color: '#C17666',
    fontWeight: '600',
    marginLeft: 0,
    marginRight: 6,
  },
  headerButtonTextDisabled: {
    color: '#D4CFC9',
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
    color: '#2D2A26',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7A756E',
    textAlign: 'center',
  },
  quoteCard: {
    backgroundColor: '#FFFFFF',
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
    color: '#2D2A26',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
  },
  quoteAuthor: {
    color: '#7A756E',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E4DF',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#2D2A26',
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
    color: '#C17666',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: 24,
  },
  footerText: {
    color: '#7A756E',
    fontSize: 14,
  },
  footerLink: {
    color: '#C17666',
    fontSize: 14,
    fontWeight: '600',
  },
});
