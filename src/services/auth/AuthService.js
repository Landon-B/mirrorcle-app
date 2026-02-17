import { Platform } from 'react-native';
import { supabase } from '../../config/supabase';

class AuthService {
  async signInWithApple() {
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign-In is only available on iOS');
    }

    const AppleAuthentication = require('expo-apple-authentication');

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error('No identity token received from Apple');
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });

    if (error) throw error;

    // Apple only provides the name on the very first sign-in
    if (credential.fullName?.givenName) {
      const fullName = [credential.fullName.givenName, credential.fullName.familyName]
        .filter(Boolean)
        .join(' ');
      await supabase.auth.updateUser({ data: { name: fullName } });
    }

    return data;
  }

  async signInWithGoogle() {
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
    const Constants = require('expo-constants');

    GoogleSignin.configure({
      iosClientId: Constants.default?.expoConfig?.extra?.googleIosClientId,
      webClientId: Constants.default?.expoConfig?.extra?.googleWebClientId,
    });

    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo.data?.idToken || userInfo.idToken;

    if (!idToken) {
      throw new Error('No ID token received from Google');
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) throw error;

    return data;
  }

  async signUp({ email, password, name }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;
    return data;
  }

  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  async verifyOtp({ email, token }) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });

    if (error) throw error;
    return data;
  }

  async resendOtp({ email }) {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) throw error;
    return data;
  }

  async resetPassword({ email }) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return data;
  }

  async verifyPasswordReset({ email, token, newPassword }) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery',
    });
    if (error) throw error;

    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (updateError) throw updateError;

    return updateData;
  }

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();
