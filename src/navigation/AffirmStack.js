import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  AffirmationHomeScreen,
  FocusSelectionScreen,
  MoodCheckInScreen,
  CameraSessionScreen,
  PostMoodReflectionScreen,
  SuccessCelebrationScreen,
} from '../screens';

const Stack = createNativeStackNavigator();

export const AffirmStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AffirmationHome" component={AffirmationHomeScreen} />
    <Stack.Screen name="FocusSelection" component={FocusSelectionScreen} />
    <Stack.Screen name="MoodCheckIn" component={MoodCheckInScreen} />
    <Stack.Screen name="Session" component={CameraSessionScreen} />
    <Stack.Screen name="PostMoodReflection" component={PostMoodReflectionScreen} />
    <Stack.Screen name="SuccessCelebration" component={SuccessCelebrationScreen} />
  </Stack.Navigator>
);
