import { useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storage';

export const useStorage = (key, initialValue = null) => {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadValue();
  }, [key]);

  const loadValue = async () => {
    try {
      const stored = await storageService.get(key);
      if (stored !== null) {
        setValue(stored);
      }
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateValue = useCallback(async (newValue) => {
    try {
      setValue(newValue);
      await storageService.set(key, newValue);
      return true;
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      return false;
    }
  }, [key]);

  const removeValue = useCallback(async () => {
    try {
      setValue(initialValue);
      await storageService.remove(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      return false;
    }
  }, [key, initialValue]);

  return { value, setValue: updateValue, removeValue, isLoading };
};
