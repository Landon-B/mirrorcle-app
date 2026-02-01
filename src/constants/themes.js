export const THEMES = {
  cosmicPurple: {
    id: 'cosmic-purple',
    name: 'Cosmic Purple',
    isPremium: false,
    gradient: ["#0F172A", "#4C1D95", "#0F172A"],
    primary: ["#A855F7", "#EC4899"],
    accent: "#C084FC",
  },
  oceanDepths: {
    id: 'ocean-depths',
    name: 'Ocean Depths',
    isPremium: false,
    gradient: ["#0F172A", "#164E63", "#0F172A"],
    primary: ["#3B82F6", "#06B6D4"],
    accent: "#22D3EE",
  },
  forestCalm: {
    id: 'forest-calm',
    name: 'Forest Calm',
    isPremium: false,
    gradient: ["#0F172A", "#14532D", "#0F172A"],
    primary: ["#22C55E", "#10B981"],
    accent: "#34D399",
  },
  sunsetGlow: {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    isPremium: true,
    gradient: ["#0F172A", "#7C2D12", "#0F172A"],
    primary: ["#F97316", "#FACC15"],
    accent: "#FB923C",
  },
  roseGarden: {
    id: 'rose-garden',
    name: 'Rose Garden',
    isPremium: true,
    gradient: ["#0F172A", "#881337", "#0F172A"],
    primary: ["#F43F5E", "#EC4899"],
    accent: "#FB7185",
  },
  midnightBlue: {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    isPremium: true,
    gradient: ["#0F172A", "#312E81", "#0F172A"],
    primary: ["#6366F1", "#A855F7"],
    accent: "#818CF8",
  },
};

export const DEFAULT_THEME = THEMES.cosmicPurple;

export const getThemeById = (id) => {
  return Object.values(THEMES).find(t => t.id === id) || DEFAULT_THEME;
};

export const getFreeThemes = () => Object.values(THEMES).filter(t => !t.isPremium);
export const getPremiumThemes = () => Object.values(THEMES).filter(t => t.isPremium);
