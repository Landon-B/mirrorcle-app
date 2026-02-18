import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeStack } from './HomeStack';
import { AffirmStack } from './AffirmStack';
import { GrowthStack } from './GrowthStack';
import { ProfileStack } from './ProfileStack';
import { useColors } from '../hooks/useColors';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  HomeTab: { focused: 'sunny', unfocused: 'sunny-outline' },
  AffirmTab: { focused: 'flower', unfocused: 'flower-outline' },
  GrowthTab: { focused: 'footsteps', unfocused: 'footsteps-outline' },
  ProfileTab: { focused: 'ellipse', unfocused: 'ellipse-outline' },
};

export const MainTabNavigator = () => {
  const c = useColors();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <Ionicons name={iconName} size={size} color={focused ? c.tabActive : c.tabInactive} />;
        },
        tabBarActiveTintColor: c.tabActive,
        tabBarInactiveTintColor: c.tabInactive,
        tabBarStyle: {
          backgroundColor: c.surfaceSecondary,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: 'Today' }} />
      <Tab.Screen name="AffirmTab" component={AffirmStack} options={{ tabBarLabel: 'Practice' }} />
      <Tab.Screen name="GrowthTab" component={GrowthStack} options={{ tabBarLabel: 'Journey' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ tabBarLabel: 'Mirror' }} />
    </Tab.Navigator>
  );
};
