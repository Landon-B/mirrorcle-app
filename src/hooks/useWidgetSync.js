import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { widgetDataService } from '../services/widget';

export const useWidgetSync = () => {
  if (Platform.OS !== 'ios') return;

  const { theme } = useTheme();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    widgetDataService.syncWidget(theme);
  }, [theme]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        widgetDataService.syncWidget(theme);
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [theme]);
};
