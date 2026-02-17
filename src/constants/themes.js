export const THEMES = {
  warmLight: {
    id: 'warm-light',
    name: 'Warm Light',
    colorScheme: 'light',
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
  eveningGlow: {
    id: 'evening-glow',
    name: 'Evening Glow',
    colorScheme: 'dark',
    isPremium: false,
    background: '#1C1917',
    cardBg: '#292524',
    accent: '#D4956E',
    accentLight: '#44302A',
    buttonGradient: ['#C17666', '#D4956E'],
    sessionGradient: ['#C17666', '#D4956E'],
    gradient: ['#231F1C', '#1C1917'],
    primary: ['#C17666', '#D4956E'],
  },
};

export const DEFAULT_THEME = THEMES.warmLight;

export const getThemeById = (id) => {
  return Object.values(THEMES).find(t => t.id === id) || DEFAULT_THEME;
};

export const getThemeForScheme = (scheme) => {
  return scheme === 'dark' ? THEMES.eveningGlow : THEMES.warmLight;
};

export const getFreeThemes = () => Object.values(THEMES).filter(t => !t.isPremium);
export const getPremiumThemes = () => Object.values(THEMES).filter(t => t.isPremium);
