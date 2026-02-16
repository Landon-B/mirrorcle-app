export const THEMES = {
  warmLight: {
    id: 'warm-light',
    name: 'Warm Light',
    isPremium: false,
    background: '#F5F2EE',
    cardBg: '#FFFFFF',
    accent: '#C17666',
    accentLight: '#E8D0C6',
    buttonGradient: ['#C17666', '#E8A090'],
    sessionGradient: ['#C17666', '#E8A090'],
    // Legacy compat: keep gradient/primary shape for ThemeContext consumers
    gradient: ['#F9F7F5', '#F5F2EE'],
    primary: ['#C17666', '#E8A090'],
  },
};

export const DEFAULT_THEME = THEMES.warmLight;

export const getThemeById = (id) => {
  return Object.values(THEMES).find(t => t.id === id) || DEFAULT_THEME;
};

export const getFreeThemes = () => Object.values(THEMES).filter(t => !t.isPremium);
export const getPremiumThemes = () => Object.values(THEMES).filter(t => t.isPremium);
