import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { storageService } from '../services/storage';
import { widgetDataService } from '../services/widget';
import { DEFAULT_THEME, getThemeById, getThemeForScheme } from '../constants';

const APPEARANCE_KEY = 'mirrorcle-appearance';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [appearancePref, setAppearancePref] = useState('system'); // 'light' | 'dark' | 'system'
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme() || 'light');
  const [isLoading, setIsLoading] = useState(true);

  const colorScheme = appearancePref === 'system' ? systemScheme : appearancePref;

  useEffect(() => {
    loadTheme();

    const subscription = Appearance.addChangeListener(({ colorScheme: scheme }) => {
      setSystemScheme(scheme || 'light');
    });

    return () => subscription?.remove();
  }, []);

  // Sync theme object when colorScheme changes
  useEffect(() => {
    if (!isLoading) {
      const newTheme = getThemeForScheme(colorScheme);
      setTheme(newTheme);
    }
  }, [colorScheme, isLoading]);

  const loadTheme = async () => {
    try {
      const savedAppearance = await storageService.get(APPEARANCE_KEY);
      if (savedAppearance && ['light', 'dark', 'system'].includes(savedAppearance)) {
        setAppearancePref(savedAppearance);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setAppearance = async (pref) => {
    setAppearancePref(pref);
    await storageService.set(APPEARANCE_KEY, pref);
    widgetDataService.syncWidget();
  };

  const changeTheme = async (themeId) => {
    const newTheme = getThemeById(themeId);
    setTheme(newTheme);
    // Sync appearance pref with theme's color scheme
    const newPref = newTheme.colorScheme || 'light';
    setAppearancePref(newPref);
    await storageService.set(APPEARANCE_KEY, newPref);
    await storageService.saveTheme(themeId);
    widgetDataService.syncWidget();
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      changeTheme,
      colorScheme,
      appearancePref,
      setAppearance,
      isLoading,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
