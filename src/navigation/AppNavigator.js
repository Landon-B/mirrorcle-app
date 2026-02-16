import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  SplashScreen,
  WelcomeScreen,
  CreateAccountScreen,
  LoginScreen,
  ForgotPasswordScreen,
  OnboardingScreen,
  PaywallScreen,
  MilestoneCelebrationScreen,
} from '../screens';
import { MainTabNavigator } from './MainTabNavigator';
import { useApp } from '../context/AppContext';
import { ErrorBoundary } from '../components/common';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { hasCompletedOnboarding, isLoading } = useApp();

  if (isLoading) {
    return null;
  }

  return (
    <ErrorBoundary>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Splash"
      >
        {/* Splash */}
        <Stack.Screen name="Splash" component={SplashScreen} />

        {/* Auth Flow */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />

        {/* Main App with Bottom Tabs */}
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />

        {/* Modals */}
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="MilestoneCelebration"
          component={MilestoneCelebrationScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </ErrorBoundary>
  );
};
