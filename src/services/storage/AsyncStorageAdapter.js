import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from './StorageService';
import { STORAGE_KEYS } from '../../constants';

// Generate UUID without external dependency
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export class AsyncStorageAdapter extends StorageService {
  // Basic key-value operations
  async get(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('AsyncStorage get error:', error);
      return null;
    }
  }

  async set(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('AsyncStorage set error:', error);
      return false;
    }
  }

  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('AsyncStorage remove error:', error);
      return false;
    }
  }

  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('AsyncStorage clear error:', error);
      return false;
    }
  }

  // User (null for local, will be UUID for Supabase)
  async getUser() {
    return null; // Local storage has no user concept
  }

  // Sessions
  async getSessions() {
    const sessions = await this.get(STORAGE_KEYS.sessions);
    return sessions || [];
  }

  async saveSession(sessionData) {
    const sessions = await this.getSessions();
    const newSession = {
      id: generateUUID(),
      userId: null, // Will be set by Supabase
      date: new Date().toISOString(),
      ...sessionData,
      createdAt: new Date().toISOString(),
    };
    sessions.push(newSession);
    await this.set(STORAGE_KEYS.sessions, sessions);
    return newSession;
  }

  // Favorites
  async getFavorites() {
    const favorites = await this.get(STORAGE_KEYS.favorites);
    return favorites || [];
  }

  async saveFavorite(affirmationId) {
    const favorites = await this.getFavorites();
    const exists = favorites.find(f => f.affirmationId === affirmationId);
    if (exists) return exists;

    const newFavorite = {
      id: generateUUID(),
      userId: null,
      affirmationId,
      createdAt: new Date().toISOString(),
    };
    favorites.push(newFavorite);
    await this.set(STORAGE_KEYS.favorites, favorites);
    return newFavorite;
  }

  async removeFavorite(affirmationId) {
    const favorites = await this.getFavorites();
    const filtered = favorites.filter(f => f.affirmationId !== affirmationId);
    await this.set(STORAGE_KEYS.favorites, filtered);
    return true;
  }

  // Stats (legacy format support + new format)
  async getStats() {
    const stats = await this.get(STORAGE_KEYS.stats);
    return stats || {
      totalSessions: 0,
      totalAffirmations: 0,
      currentStreak: 0,
      lastSessionDate: null,
      feelingsHistory: [],
    };
  }

  async saveStats(stats) {
    await this.set(STORAGE_KEYS.stats, {
      ...stats,
      updatedAt: new Date().toISOString(),
    });
    return true;
  }

  // Preferences
  async getPreferences() {
    const prefs = await this.get(STORAGE_KEYS.preferences);
    return prefs || {
      isPro: false,
      themeId: 'cosmic-purple',
      notificationsEnabled: false,
      notificationTime: '09:00',
      audioAutoPlay: false,
    };
  }

  async savePreferences(preferences) {
    const current = await this.getPreferences();
    await this.set(STORAGE_KEYS.preferences, {
      ...current,
      ...preferences,
      updatedAt: new Date().toISOString(),
    });
    return true;
  }

  // Theme
  async getTheme() {
    return this.get(STORAGE_KEYS.theme);
  }

  async saveTheme(themeId) {
    await this.set(STORAGE_KEYS.theme, themeId);
    const prefs = await this.getPreferences();
    await this.savePreferences({ ...prefs, themeId });
    return true;
  }

  // Onboarding
  async hasCompletedOnboarding() {
    const completed = await this.get(STORAGE_KEYS.onboarding);
    return completed === true;
  }

  async setOnboardingCompleted() {
    await this.set(STORAGE_KEYS.onboarding, true);
    return true;
  }

  // Current feeling (for session)
  async getCurrentFeeling() {
    return this.get(STORAGE_KEYS.feeling);
  }

  async setCurrentFeeling(feeling) {
    await this.set(STORAGE_KEYS.feeling, feeling);
    return true;
  }
}

// Singleton instance
export const storageService = new AsyncStorageAdapter();
