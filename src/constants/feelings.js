// ============================================================
// Emotional Landscape — Two-Layer Mood System
// ============================================================
//
// Architecture: MOOD_FAMILIES (broad) → MOODS (specific)
//
// Each family contains 3 specific feelings. To expand:
//   1. Add a new entry to MOODS with a `family` key matching the family id
//   2. Add an entry to FEELING_COLORS
//   3. Add a Supabase migration (INSERT into feelings + feeling_tags)
//   4. Update MOOD_FAMILIES[].feelings array if adding to existing family
//   5. To add an entirely new family, add to MOOD_FAMILIES and create its moods
//
// Downstream consumers (charts, analytics, journey) resolve through
// getMoodById / getMoodEmoji / getFeelingColor — they auto-update.
// Only JourneyService.js mood sentiment sets need manual updates.
// ============================================================

// --- Emotional Families (the first tap) ---

export const MOOD_FAMILIES = [
  {
    id: 'peaceful',
    label: 'Peaceful',
    emoji: '\uD83C\uDF3F',       // 🌿
    description: 'Settled, grounded, at ease',
    feelings: ['calm', 'grateful', 'content'],
  },
  {
    id: 'tender',
    label: 'Tender',
    emoji: '\uD83E\uDEF6',       // 🫶
    description: 'Soft, open, feeling deeply',
    feelings: ['sad', 'lonely', 'vulnerable'],
  },
  {
    id: 'electric',
    label: 'Electric',
    emoji: '\u26A1',              // ⚡
    description: 'Alive, bright, moving forward',
    feelings: ['energized', 'confident', 'hopeful'],
  },
  {
    id: 'heavy',
    label: 'Heavy',
    emoji: '\uD83C\uDF0A',       // 🌊
    description: 'Weighed down, turbulent, tight',
    feelings: ['anxious', 'overwhelmed', 'frustrated'],
  },
];

// --- Specific Moods (the second tap) ---

export const MOODS = [
  // Peaceful family
  { id: 'calm',        label: 'Calm',        emoji: '\uD83D\uDE0C', family: 'peaceful'  },  // 😌
  { id: 'grateful',    label: 'Grateful',    emoji: '\uD83D\uDE4F', family: 'peaceful'  },  // 🙏
  { id: 'content',     label: 'Content',     emoji: '\u2615',       family: 'peaceful'  },  // ☕

  // Tender family
  { id: 'sad',         label: 'Sad',         emoji: '\uD83D\uDE14', family: 'tender'    },  // 😔
  { id: 'lonely',      label: 'Lonely',      emoji: '\uD83E\uDEE7', family: 'tender'    },  // 🫧
  { id: 'vulnerable',  label: 'Vulnerable',  emoji: '\uD83E\uDD8B', family: 'tender'    },  // 🦋

  // Electric family
  { id: 'energized',   label: 'Energized',   emoji: '\u26A1',       family: 'electric'  },  // ⚡
  { id: 'confident',   label: 'Confident',   emoji: '\u2728',       family: 'electric'  },  // ✨
  { id: 'hopeful',     label: 'Hopeful',     emoji: '\uD83C\uDF1F', family: 'electric'  },  // 🌟

  // Heavy family
  { id: 'anxious',     label: 'Anxious',     emoji: '\uD83D\uDE1F', family: 'heavy'     },  // 😟
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '\uD83E\uDD2F', family: 'heavy'     },  // 🤯
  { id: 'frustrated',  label: 'Frustrated',  emoji: '\uD83D\uDE24', family: 'heavy'     },  // 😤
];

// --- Helpers ---

export const getMoodById = (id) => MOODS.find(m => m.id === id);
export const getMoodLabel = (id) => getMoodById(id)?.label || id;
export const getMoodEmoji = (id) => getMoodById(id)?.emoji || '';
export const getMoodFamily = (id) => {
  const mood = getMoodById(id);
  return mood ? MOOD_FAMILIES.find(f => f.id === mood.family) : null;
};
export const getFamilyById = (id) => MOOD_FAMILIES.find(f => f.id === id);
export const getMoodsForFamily = (familyId) => MOODS.filter(m => m.family === familyId);

// --- Colors ---

export const FEELING_COLORS = {
  // Peaceful
  calm:        '#C17666',
  grateful:    '#34D399',
  content:     '#D4956E',

  // Tender
  sad:         '#818CF8',
  lonely:      '#F472B6',
  vulnerable:  '#C4B5FD',

  // Electric
  energized:   '#F97316',
  confident:   '#C17666',
  hopeful:     '#FBBF24',

  // Heavy
  anxious:     '#60A5FA',
  overwhelmed: '#A78BFA',
  frustrated:  '#EF4444',

  // V1 legacy (kept for backward compat with existing session data)
  happy:       '#FACC15',
  amazing:     '#FACC15',
  okay:        '#38BDF8',
  low:         '#94A3B8',
  struggling:  '#A78BFA',
  angry:       '#EF4444',
};

export const DEFAULT_FEELING_COLOR = '#B0AAA2';

export const getFeelingColor = (id) => FEELING_COLORS[id] || DEFAULT_FEELING_COLOR;

// --- V1 feelings (deprecated, kept for backward compat with existing session data) ---

export const FEELINGS = [
  { id: "amazing", label: "Amazing", icon: "flash", colors: ["#FACC15", "#FB923C"] },
  { id: "happy", label: "Happy", icon: "emoticon-happy", colors: ["#4ADE80", "#34D399"] },
  { id: "grateful", label: "Grateful", icon: "heart", colors: ["#FB7185", "#F43F5E"] },
  { id: "okay", label: "Okay", icon: "emoticon-neutral", colors: ["#38BDF8", "#22D3EE"] },
  { id: "low", label: "Low", icon: "weather-cloudy", colors: ["#94A3B8", "#64748B"] },
  { id: "struggling", label: "Struggling", icon: "emoticon-sad", colors: ["#A855F7", "#6366F1"] },
];

// --- Cross-compat helpers ---

export const getFeelingById = (id) => {
  return getMoodById(id) || FEELINGS.find(f => f.id === id);
};
export const getFeelingLabel = (id) => getFeelingById(id)?.label || id;
