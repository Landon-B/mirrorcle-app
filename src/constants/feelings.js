// V2 moods - primary mood system
export const MOODS = [
  { id: 'calm', label: 'Calm', emoji: '\uD83D\uDE0C', bgColor: '#EDE4DC' },
  { id: 'anxious', label: 'Anxious', emoji: '\uD83D\uDE1F', bgColor: '#EDE4DC' },
  { id: 'confident', label: 'Confident', emoji: '\u2728', bgColor: '#EDE4DC' },
  { id: 'sad', label: 'Sad', emoji: '\uD83D\uDE14', bgColor: '#EDE4DC' },
  { id: 'energized', label: 'Energized', emoji: '\u26A1', bgColor: '#EDE4DC' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '\uD83E\uDD2F', bgColor: '#EDE4DC' },
];

export const getMoodById = (id) => MOODS.find(m => m.id === id);
export const getMoodLabel = (id) => getMoodById(id)?.label || id;
export const getMoodEmoji = (id) => getMoodById(id)?.emoji || '';

// V1 feelings - deprecated, kept for backward compat with existing session data
export const FEELINGS = [
  { id: "amazing", label: "Amazing", icon: "flash", colors: ["#FACC15", "#FB923C"] },
  { id: "happy", label: "Happy", icon: "emoticon-happy", colors: ["#4ADE80", "#34D399"] },
  { id: "grateful", label: "Grateful", icon: "heart", colors: ["#FB7185", "#F43F5E"] },
  { id: "okay", label: "Okay", icon: "emoticon-neutral", colors: ["#38BDF8", "#22D3EE"] },
  { id: "low", label: "Low", icon: "weather-cloudy", colors: ["#94A3B8", "#64748B"] },
  { id: "struggling", label: "Struggling", icon: "emoticon-sad", colors: ["#A855F7", "#6366F1"] },
];

export const FEELING_COLORS = {
  happy: '#FACC15',
  confident: '#C17666',
  grateful: '#34D399',
  anxious: '#60A5FA',
  struggling: '#A78BFA',
  lonely: '#F472B6',
  angry: '#EF4444',
  sad: '#818CF8',
  amazing: '#FACC15',
  okay: '#38BDF8',
  low: '#94A3B8',
  calm: '#C17666',
  energized: '#F97316',
  overwhelmed: '#A78BFA',
};

export const DEFAULT_FEELING_COLOR = '#B0AAA2';

export const getFeelingById = (id) => {
  return getMoodById(id) || FEELINGS.find(f => f.id === id);
};
export const getFeelingLabel = (id) => getFeelingById(id)?.label || id;
export const getFeelingColor = (id) => FEELING_COLORS[id] || DEFAULT_FEELING_COLOR;
