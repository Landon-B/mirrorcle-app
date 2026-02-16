import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GrowthDashboardScreen, ActivityCalendarScreen } from '../screens';

const Stack = createNativeStackNavigator();

export const GrowthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="GrowthDashboard" component={GrowthDashboardScreen} />
    <Stack.Screen name="ActivityCalendar" component={ActivityCalendarScreen} />
  </Stack.Navigator>
);
