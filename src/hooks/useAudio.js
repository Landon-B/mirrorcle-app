import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { AudioService } from '../services/audio';

export const useAudio = () => {
  const { preferences, isPro } = useApp();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const speakAffirmation = useCallback(async (text, onComplete) => {
    if (!isPro) {
      console.log('Audio affirmations require Pro');
      return false;
    }

    setIsSpeaking(true);
    await AudioService.speakAffirmation(text, () => {
      setIsSpeaking(false);
      if (onComplete) onComplete();
    });
    return true;
  }, [isPro]);

  const speakAffirmations = useCallback(async (texts, options = {}) => {
    if (!isPro) {
      console.log('Audio affirmations require Pro');
      return false;
    }

    setIsSpeaking(true);
    await AudioService.speakAffirmations(texts, {
      ...options,
      onProgress: (index, total) => {
        setCurrentIndex(index);
        if (options.onProgress) options.onProgress(index, total);
      },
      onComplete: () => {
        setIsSpeaking(false);
        setCurrentIndex(-1);
        if (options.onComplete) options.onComplete();
      },
    });
    return true;
  }, [isPro]);

  const stopSpeaking = useCallback(async () => {
    await AudioService.stopSpeaking();
    setIsSpeaking(false);
    setCurrentIndex(-1);
  }, []);

  return {
    isSpeaking,
    currentIndex,
    speakAffirmation,
    speakAffirmations,
    stopSpeaking,
    autoPlayEnabled: preferences.audioAutoPlay && isPro,
  };
};
