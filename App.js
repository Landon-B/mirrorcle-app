import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/context/ThemeContext';
import { AppProvider } from './src/context/AppContext';
import { AppNavigator } from './src/navigation';

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AppProvider>
    </ThemeProvider>
  );
}
