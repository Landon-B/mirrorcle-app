// This service will be fully implemented when expo-av and expo-speech are installed
// For now, it provides the interface and placeholder implementations

class AudioServiceClass {
  constructor() {
    this.isPlaying = false;
    this.isSpeaking = false;
  }

  async speakText(text, options = {}) {
    // Will use Speech.speak() from expo-speech
    const {
      language = 'en-US',
      pitch = 1.0,
      rate = 0.9,
      onDone = () => {},
      onError = () => {},
    } = options;

    console.log(`Speaking: "${text}"`);
    this.isSpeaking = true;

    // Example implementation with expo-speech:
    // Speech.speak(text, {
    //   language,
    //   pitch,
    //   rate,
    //   onDone: () => {
    //     this.isSpeaking = false;
    //     onDone();
    //   },
    //   onError: (error) => {
    //     this.isSpeaking = false;
    //     onError(error);
    //   },
    // });

    // Simulate speaking duration
    setTimeout(() => {
      this.isSpeaking = false;
      onDone();
    }, 2000);

    return true;
  }

  async stopSpeaking() {
    // Will use Speech.stop() from expo-speech
    console.log('Stopping speech');
    this.isSpeaking = false;
    // Speech.stop();
    return true;
  }

  async isSpeakingAsync() {
    // Will use Speech.isSpeakingAsync()
    return this.isSpeaking;
  }

  async getAvailableVoices() {
    // Will use Speech.getAvailableVoicesAsync()
    // Returns available TTS voices
    return [];
  }

  async playSound(soundUri) {
    // Will use Audio.Sound from expo-av
    console.log(`Playing sound: ${soundUri}`);
    this.isPlaying = true;

    // Example implementation with expo-av:
    // const { sound } = await Audio.Sound.createAsync({ uri: soundUri });
    // await sound.playAsync();
    // sound.setOnPlaybackStatusUpdate((status) => {
    //   if (status.didJustFinish) {
    //     this.isPlaying = false;
    //     sound.unloadAsync();
    //   }
    // });

    return true;
  }

  async stopSound() {
    // Will stop current sound playback
    console.log('Stopping sound');
    this.isPlaying = false;
    return true;
  }

  async setAudioMode() {
    // Configure audio session for the app
    // Will use Audio.setAudioModeAsync() from expo-av

    // Example:
    // await Audio.setAudioModeAsync({
    //   allowsRecordingIOS: false,
    //   playsInSilentModeIOS: true,
    //   staysActiveInBackground: false,
    //   shouldDuckAndroid: true,
    // });

    return true;
  }

  // Helper to speak an affirmation with proper pacing
  async speakAffirmation(text, onComplete) {
    // Add a pause before and after for better experience
    await this.speakText(text, {
      rate: 0.85,
      pitch: 1.0,
      onDone: onComplete,
    });
  }

  // Speak multiple affirmations with pauses
  async speakAffirmations(texts, options = {}) {
    const { pauseBetween = 2000, onProgress, onComplete } = options;

    for (let i = 0; i < texts.length; i++) {
      if (onProgress) onProgress(i, texts.length);

      await new Promise((resolve) => {
        this.speakAffirmation(texts[i], resolve);
      });

      if (i < texts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, pauseBetween));
      }
    }

    if (onComplete) onComplete();
  }
}

export const AudioService = new AudioServiceClass();
