import { useState, useEffect, useCallback, useRef } from 'react';
import { storageService } from '../services/storage';

export const useStorage = (key, initialValue = null) => {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const currentKeyRef = useRef(key);

  useEffect(() => {
    currentKeyRef.current = key;
    setIsLoading(true);

    const loadValue = async () => {
      try {
        const stored = await storageService.get(key);
        // Only update if this is still the current key (prevents race condition)
        if (currentKeyRef.current === key) {
          if (stored !== null) {
            setValue(stored);
          } else {
            setValue(initialValue);
          }
        }
      } catch (error) {
        console.error(`Error loading ${key}:`, error);
      } finally {
        if (currentKeyRef.current === key) {
          setIsLoading(false);
        }
      }
    };

    loadValue();
  }, [key]);

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
