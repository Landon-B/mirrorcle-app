import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { widgetDataService } from '../services/widget';

export const useWidgetSync = () => {
  if (Platform.OS !== 'ios') return;

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    widgetDataService.syncWidget();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        widgetDataService.syncWidget();
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);
};
