import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SpeechRecognitionService } from '../services/speech';

export const useSpeechRecognition = () => {
  const isListeningRef = useRef(false);
  const [isListening, setIsListening] = useState(false);
  const [partial, setPartial] = useState('');
  const [finalText, setFinalText] = useState('');
  const [error, setError] = useState(null);

  const isSupported = useMemo(() => {
    if (!SpeechRecognitionService || !SpeechRecognitionService.isSupported) return false;
    return SpeechRecognitionService.isSupported();
  }, []);

  const startListening = useCallback(async (options = {}) => {
    setError(null);
    setPartial('');
    setFinalText('');

    const started = await SpeechRecognitionService.startListening({
      ...options,
      onStart: () => {
        setIsListening(true);
        isListeningRef.current = true;
        if (options.onStart) options.onStart();
      },
      onPartial: (text) => {
        setPartial(text);
        if (options.onPartial) options.onPartial(text);
      },
      onFinal: (text) => {
        setFinalText(text);
        if (options.onFinal) options.onFinal(text);
      },
      onError: (err) => {
        setError(err);
        if (options.onError) options.onError(err);
      },
      onEnd: () => {
        setIsListening(false);
        isListeningRef.current = false;
        if (options.onEnd) options.onEnd();
      },
    });

    if (!started) {
      setIsListening(false);
    }

    return started;
  }, []);

  const stopListening = useCallback(async () => {
    await SpeechRecognitionService.stopListening();
    setIsListening(false);
    isListeningRef.current = false;
  }, []);

  // Cleanup: stop listening on unmount
  useEffect(() => {
    return () => {
      if (isListeningRef.current) {
        SpeechRecognitionService.stopListening().catch(() => {});
      }
    };
  }, []);

  return {
    isListening,
    partial,
    finalText,
    error,
    isSupported,
    startListening,
    stopListening,
  };
};
