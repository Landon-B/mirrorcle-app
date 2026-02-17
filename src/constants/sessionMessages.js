export const GAZE_PROMPTS = [
  "Look into your own eyes.",
  "See yourself. Really see yourself.",
  "This person is worth your time.",
  "You showed up. That matters.",
  "Be gentle with what you see.",
  "Meet yourself with kindness.",
  "This is your moment.",
];

export const COMPLETION_MESSAGES = [
  "Let that land.",
  "Notice how that feels.",
  "You meant that.",
  "That truth lives in you now.",
  "Your voice made that real.",
  "Breathe that in.",
  "Let yourself believe it.",
];

export const FINAL_COMPLETION_MESSAGES = [
  "You showed up for yourself today.",
  "This is what self-love sounds like.",
  "Every word was a gift to yourself.",
  "You chose yourself. That's everything.",
];

export const SPEAKING_INSTRUCTIONS = [
  "Speak this to yourself.",
  "Say it like you believe it.",
  "Let yourself hear this.",
  "Mean every word.",
  "Say this with intention.",
];

// Simple string hash for daily seed
export const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

// Get daily-seeded message from array
export const getDailyMessage = (messages) => {
  const today = new Date().toDateString();
  const seed = hashCode(today);
  return messages[seed % messages.length];
};
