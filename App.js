import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/context/ThemeContext';
import { AppProvider } from './src/context/AppContext';
import { AppNavigator } from './src/navigation';
import { NotificationService } from './src/services/notifications';
import { useWidgetSync } from './src/hooks/useWidgetSync';

const navigationRef = createNavigationContainerRef();

const linking = {
  prefixes: ['mirrorcle://'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          HomeTab: {
            screens: {
              Home: 'home',
            },
          },
        },
      },
    },
  },
};

function AppContent() {
  useWidgetSync();
  return <AppNavigator />;
}

export default function App() {
  useEffect(() => {
    const cleanup = NotificationService.setupNotificationHandler(navigationRef);
    return cleanup;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <ThemeProvider>
        <AppProvider>
          <NavigationContainer ref={navigationRef} linking={linking}>
            <AppContent />
          </NavigationContainer>
        </AppProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
