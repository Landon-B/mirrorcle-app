import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { widgetDataService } from '../services/widget';
import { DEFAULT_THEME, getThemeById } from '../constants';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedThemeId = await storageService.getTheme();
      if (savedThemeId) {
        const savedTheme = getThemeById(savedThemeId);
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeTheme = async (themeId) => {
    const newTheme = getThemeById(themeId);
    setTheme(newTheme);
    await storageService.saveTheme(themeId);
    widgetDataService.syncWidget();
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, isLoading }}>
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
