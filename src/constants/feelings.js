// ============================================================
// Emotional Landscape — Two-Layer Mood System
// ============================================================
//
// Architecture: MOOD_FAMILIES (broad) → MOODS (specific)
//
// Each family contains 3-4 specific feelings. To expand:
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
    emoji: '\uD83C\uDF43',       // 🍃
    description: 'Settled, grounded, at ease',
    feelings: ['calm', 'grateful', 'content'],
  },
  {
    id: 'tender',
    label: 'Tender',
    emoji: '\uD83E\uDD32',       // 🤲
    description: 'Soft, open, feeling deeply',
    feelings: ['sad', 'lonely', 'vulnerable'],
  },
  {
    id: 'electric',
    label: 'Electric',
    emoji: '\u2728',              // ✨
    description: 'Alive, bright, moving forward',
    feelings: ['energized', 'confident', 'hopeful'],
  },
  {
    id: 'heavy',
    label: 'Heavy',
    emoji: '\uD83C\uDF0A',       // 🌊
    description: 'Weighed down, turbulent, tight',
    feelings: ['anxious', 'overwhelmed', 'frustrated', 'ashamed'],
  },
  {
    id: 'still',
    label: 'Still',
    emoji: '\uD83C\uDF2B\uFE0F', // 🌫️
    description: 'Empty, muted, far away',
    feelings: ['numb', 'disconnected', 'drained'],
  },
];

// --- Specific Moods (the second tap) ---

export const MOODS = [
  // Peaceful family
  { id: 'calm',         label: 'Calm',         emoji: '\uD83D\uDE0C', family: 'peaceful',  description: 'At ease, settled inside'        },  // 😌
  { id: 'grateful',     label: 'Grateful',     emoji: '\uD83D\uDE4F', family: 'peaceful',  description: 'Thankful, heart-full'            },  // 🙏
  { id: 'content',      label: 'Content',      emoji: '\uD83E\uDED6', family: 'peaceful',  description: 'Enough, just as it is'           },  // 🫖

  // Tender family
  { id: 'sad',          label: 'Sad',          emoji: '\uD83E\uDD40', family: 'tender',    description: 'Heavy-hearted, something aches'  },  // 🥀
  { id: 'lonely',       label: 'Lonely',       emoji: '\uD83E\uDE90', family: 'tender',    description: 'Isolated, missing connection'     },  // 🪐
  { id: 'vulnerable',   label: 'Vulnerable',   emoji: '\uD83E\uDD8B', family: 'tender',    description: 'Exposed, open, unguarded'        },  // 🦋

  // Electric family
  { id: 'energized',    label: 'Energized',    emoji: '\uD83D\uDD25', family: 'electric',  description: 'Fired up, alive, moving'         },  // 🔥
  { id: 'confident',    label: 'Confident',    emoji: '\uD83D\uDC51', family: 'electric',  description: 'Standing tall, owning it'        },  // 👑
  { id: 'hopeful',      label: 'Hopeful',      emoji: '\uD83C\uDF05', family: 'electric',  description: 'Something good is coming'        },  // 🌅

  // Heavy family
  { id: 'anxious',      label: 'Anxious',      emoji: '\uD83E\uDEE8', family: 'heavy',     description: 'Racing thoughts, tightness'      },  // 🫨
  { id: 'overwhelmed',  label: 'Overwhelmed',  emoji: '\uD83D\uDE2E\u200D\uD83D\uDCA8', family: 'heavy', description: 'Too much at once'  },  // 😮‍💨
  { id: 'frustrated',   label: 'Frustrated',   emoji: '\uD83D\uDE24', family: 'heavy',     description: 'Blocked, stuck, pressured'       },  // 😤
  { id: 'ashamed',      label: 'Ashamed',      emoji: '\uD83E\uDEE0', family: 'heavy',     description: 'Shrinking, self-judging'         },  // 🫠

  // Still family
  { id: 'numb',         label: 'Numb',         emoji: '\uD83D\uDE36\u200D\uD83C\uDF2B\uFE0F', family: 'still', description: 'Flat, feeling nothing' },  // 😶‍🌫️
  { id: 'disconnected', label: 'Detached',      emoji: '\uD83E\uDEE5', family: 'still',     description: 'Far away, going through motions' },  // 🫥
  { id: 'drained',      label: 'Drained',      emoji: '\uD83D\uDD6F\uFE0F', family: 'still', description: 'Used up, running on empty'     },  // 🕯️

  // Special
  { id: 'unsure',       label: 'Something unnamed', emoji: '\uD83E\uDD0D', family: null,   description: 'Hard to name right now'          },  // 🤍
];

// --- Helpers ---

export const getMoodById = (id) => MOODS.find(m => m.id === id);
export const getMoodLabel = (id) => getMoodById(id)?.label || id;
export const getMoodEmoji = (id) => getMoodById(id)?.emoji || '';
export const getMoodDescription = (id) => getMoodById(id)?.description || '';
export const getMoodFamily = (id) => {
  const mood = getMoodById(id);
  return mood ? MOOD_FAMILIES.find(f => f.id === mood.family) : null;
};
export const getFamilyById = (id) => MOOD_FAMILIES.find(f => f.id === id);
export const getMoodsForFamily = (familyId) => MOODS.filter(m => m.family === familyId);

// --- Colors ---

export const FEELING_COLORS = {
  // Peaceful
  calm:         '#C17666',
  grateful:     '#34D399',
  content:      '#D4956E',

  // Tender
  sad:          '#818CF8',
  lonely:       '#F472B6',
  vulnerable:   '#C4B5FD',

  // Electric
  energized:    '#F97316',
  confident:    '#C17666',
  hopeful:      '#FBBF24',

  // Heavy
  anxious:      '#60A5FA',
  overwhelmed:  '#A78BFA',
  frustrated:   '#EF4444',
  ashamed:      '#E879A0',

  // Still
  numb:         '#94A3B8',
  disconnected: '#78716C',
  drained:      '#D4956E',

  // Special
  unsure:       '#B0AAA2',

  // V1 legacy (kept for backward compat with existing session data)
  happy:        '#FACC15',
  amazing:      '#FACC15',
  okay:         '#38BDF8',
  low:          '#94A3B8',
  struggling:   '#A78BFA',
  angry:        '#EF4444',
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
