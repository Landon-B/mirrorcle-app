import { Platform } from 'react-native';

const getNativeVoice = () => {
  if (Platform.OS === 'web') return null;
  try {
    const voiceModule = require('@react-native-voice/voice');
    return voiceModule?.default || voiceModule || null;
  } catch (error) {
    return null;
  }
};

class SpeechRecognitionServiceClass {
  constructor() {
    this.isListening = false;
    this.recognizer = null;
    this.usingNative = false;
    this.voice = null;
  }

  isSupported() {
    const nativeVoice = getNativeVoice();
    if (nativeVoice) return true;
    if (Platform.OS !== 'web') return false;
    if (typeof window === 'undefined') return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  async startListening(options = {}) {
    const nativeVoice = getNativeVoice();
    if (nativeVoice) {
      return this._startNativeListening(nativeVoice, options);
    }

    return this._startWebListening(options);
  }

  async stopListening() {
    if (this.usingNative) {
      return this._stopNativeListening();
    }
    return this._stopWebListening();
  }

  async _startNativeListening(voice, options) {
    if (!voice) return false;

    // Clean up any previous session before starting a new one
    if (this.isListening) {
      await this.stopListening();
    }

    const { language = 'en-US', onStart, onPartial, onFinal, onError, onEnd } = options;

    this.voice = voice;
    this.usingNative = true;

    voice.onSpeechStart = () => {
      this.isListening = true;
      if (onStart) onStart();
    };

    voice.onSpeechPartialResults = (event) => {
      const partial = event?.value?.[0];
      if (partial && onPartial) onPartial(partial);
    };

    voice.onSpeechResults = (event) => {
      const finalText = event?.value?.[0];
      if (finalText && onFinal) onFinal(finalText);
    };

    voice.onSpeechError = (event) => {
      if (onError) onError(event?.error || event);
    };

    voice.onSpeechEnd = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      await voice.start(language);
      return true;
    } catch (error) {
      this.isListening = false;
      this.usingNative = false;
      if (this.voice) {
        this.voice.onSpeechStart = null;
        this.voice.onSpeechPartialResults = null;
        this.voice.onSpeechResults = null;
        this.voice.onSpeechError = null;
        this.voice.onSpeechEnd = null;
      }
      this.voice = null;
      if (onError) onError(error);
      return false;
    }
  }

  async _stopNativeListening() {
    if (!this.voice) {
      this.isListening = false;
      this.usingNative = false;
      return true;
    }

    try {
      await this.voice.stop();
    } catch (error) {
      // Ignore stop errors and attempt cleanup.
    }

    try {
      await this.voice.destroy();
      if (this.voice.removeAllListeners) {
        this.voice.removeAllListeners();
      }
    } catch (error) {
      // Ignore cleanup errors.
    }

    this.voice.onSpeechStart = null;
    this.voice.onSpeechPartialResults = null;
    this.voice.onSpeechResults = null;
    this.voice.onSpeechError = null;
    this.voice.onSpeechEnd = null;

    this.voice = null;
    this.isListening = false;
    this.usingNative = false;
    return true;
  }

  async _startWebListening(options) {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      console.warn('Speech recognition is not configured for this platform.');
      return false;
    }

    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      console.warn('Speech recognition is not available in this browser.');
      return false;
    }

    // Clean up any previous web recognizer before starting a new one
    if (this.recognizer) {
      try { this.recognizer.stop(); } catch (e) { /* ignore */ }
      this.recognizer = null;
    }

    const {
      language = 'en-US',
      continuous = true,
      interimResults = true,
      onStart,
      onPartial,
      onFinal,
      onError,
      onEnd,
    } = options;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognizer = new SpeechRecognition();

    recognizer.lang = language;
    recognizer.continuous = continuous;
    recognizer.interimResults = interimResults;

    recognizer.onstart = () => {
      this.isListening = true;
      if (onStart) onStart();
    };

    recognizer.onerror = (event) => {
      if (onError) onError(event?.error || event);
    };

    recognizer.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    recognizer.onresult = (event) => {
      if (!event?.results) return;
      let interim = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result?.[0]?.transcript?.trim();
        if (!transcript) continue;

        if (result.isFinal) {
          finalText = finalText ? `${finalText} ${transcript}` : transcript;
        } else {
          interim = interim ? `${interim} ${transcript}` : transcript;
        }
      }

      if (interim && onPartial) onPartial(interim);
      if (finalText && onFinal) onFinal(finalText);
    };

    this.recognizer = recognizer;
    recognizer.start();

    return true;
  }

  async _stopWebListening() {
    if (this.recognizer) {
      this.recognizer.stop();
      this.recognizer = null;
    }
    this.isListening = false;
    this.usingNative = false;
    return true;
  }
}

export const SpeechRecognitionService = new SpeechRecognitionServiceClass();
