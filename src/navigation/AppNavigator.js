import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  HomeScreen,
  AffirmationHomeScreen,
  FeelingsScreen,
  CameraSessionScreen,
  ReflectionScreen,
  FavoritesScreen,
  TrendsScreen,
  ThemesScreen,
  OnboardingScreen,
  PaywallScreen,
  NotificationSettingsScreen,
  WelcomeScreen,
  CreateAccountScreen,
  LoginScreen,
} from '../screens';
import { useApp } from '../context/AppContext';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { hasCompletedOnboarding, isLoading } = useApp();

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={hasCompletedOnboarding ? 'Home' : 'Welcome'}
    >
      {/* Auth Flow */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />

      {/* Main Flow */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AffirmationHome" component={AffirmationHomeScreen} />
      <Stack.Screen name="Feelings" component={FeelingsScreen} />
      <Stack.Screen name="Session" component={CameraSessionScreen} />
      <Stack.Screen name="Reflection" component={ReflectionScreen} />

      {/* Profile Screens */}
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Trends" component={TrendsScreen} />
      <Stack.Screen name="Themes" component={ThemesScreen} />

      {/* Settings Screens */}
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
};
