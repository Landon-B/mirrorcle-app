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
  confident: '#F97316',
  grateful: '#34D399',
  anxious: '#60A5FA',
  struggling: '#A78BFA',
  lonely: '#F472B6',
  angry: '#EF4444',
  sad: '#818CF8',
  amazing: '#FACC15',
  okay: '#38BDF8',
  low: '#94A3B8',
};

export const DEFAULT_FEELING_COLOR = '#94A3B8';

export const getFeelingById = (id) => FEELINGS.find(f => f.id === id);
export const getFeelingLabel = (id) => getFeelingById(id)?.label || id;
export const getFeelingColor = (id) => FEELING_COLORS[id] || DEFAULT_FEELING_COLOR;
