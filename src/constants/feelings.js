// ============================================================
// Emotional Landscape — Circumplex Quadrant Model
// ============================================================
//
// Architecture: QUADRANTS (energy × pleasantness) → MOODS (specific)
//
// Based on the Russell Circumplex Model of Affect:
//   - Y axis: Energy (high ↔ low)
//   - X axis: Pleasantness (pleasant ↔ unpleasant)
//
// Four quadrants:
//   Bright  = High Energy + Pleasant   (amber/gold)
//   Charged = High Energy + Unpleasant (coral/terracotta)
//   Tender  = Low Energy  + Pleasant   (sage/green)
//   Deep    = Low Energy  + Unpleasant (blue/lavender)
//
// To add a new mood:
//   1. Add entry to MOODS with `quadrant` matching a quadrant id
//   2. Add entry to FEELING_COLORS within the quadrant's color range
//   3. Add entries to MOOD_RESPONSES and POST_MOOD_RESPONSES
//   4. Add a Supabase migration (INSERT into feelings + feeling_tags)
//
// Downstream consumers (charts, analytics, journey) resolve through
// getMoodById / getMoodLabel / getFeelingColor — they auto-update.
// JourneyService uses quadrant-based sentiment (bright/tender = positive).
// ============================================================

// --- Emotional Quadrants (the first tap) ---

export const QUADRANTS = [
  {
    id: 'bright',
    label: 'Bright',
    description: 'Alive, buzzing, upward',
    position: 'top-right',
    colorPrimary: '#D4956E',
    colorLight: '#F5E0C8',
    colorDark: '#B87D52',
  },
  {
    id: 'charged',
    label: 'Charged',
    description: 'Turbulent, tight, stirred',
    position: 'top-left',
    colorPrimary: '#C17666',
    colorLight: '#E8C0B8',
    colorDark: '#A05A4C',
  },
  {
    id: 'tender',
    label: 'Tender',
    description: 'Settled, soft, held',
    position: 'bottom-right',
    colorPrimary: '#8DAA82',
    colorLight: '#C8D8C0',
    colorDark: '#6E8E60',
  },
  {
    id: 'deep',
    label: 'Deep',
    description: 'Still, heavy, far away',
    position: 'bottom-left',
    colorPrimary: '#8898B0',
    colorLight: '#B8C4D8',
    colorDark: '#6878A0',
  },
];

// --- Specific Moods (the second tap — bubble cloud) ---

export const MOODS = [
  // ═══ Bright quadrant (High Energy + Pleasant) ═══
  { id: 'energized',    label: 'Energized',    emoji: '\uD83D\uDD25', quadrant: 'bright',  bubbleSize: 'large',  definition: 'Fired up, alive, ready to move'            },  // 🔥
  { id: 'confident',    label: 'Confident',    emoji: '\uD83D\uDC51', quadrant: 'bright',  bubbleSize: 'large',  definition: 'Standing tall, trusting yourself'           },  // 👑
  { id: 'hopeful',      label: 'Hopeful',      emoji: '\uD83C\uDF05', quadrant: 'bright',  bubbleSize: 'medium', definition: 'Sensing that something good is coming'       },  // 🌅
  { id: 'grateful',     label: 'Grateful',     emoji: '\uD83D\uDE4F', quadrant: 'bright',  bubbleSize: 'medium', definition: 'Heart-full, thankful for what you have'      },  // 🙏
  { id: 'excited',      label: 'Excited',      emoji: '\u2728',       quadrant: 'bright',  bubbleSize: 'medium', definition: 'Buzzing with anticipation and energy'        },  // ✨
  { id: 'inspired',     label: 'Inspired',     emoji: '\uD83D\uDCA1', quadrant: 'bright',  bubbleSize: 'small',  definition: 'Moved to create, to act, to dream'          },  // 💡
  { id: 'proud',        label: 'Proud',        emoji: '\uD83C\uDFC6', quadrant: 'bright',  bubbleSize: 'small',  definition: 'Recognizing your own worth and effort'       },  // 🏆
  { id: 'joyful',       label: 'Joyful',       emoji: '\uD83C\uDF1F', quadrant: 'bright',  bubbleSize: 'medium', definition: 'Light, open, genuinely happy'                },  // 🌟
  { id: 'amused',       label: 'Amused',       emoji: '\uD83D\uDE04', quadrant: 'bright',  bubbleSize: 'small',  definition: 'Finding humor and lightness in things'       },  // 😄

  // ═══ Charged quadrant (High Energy + Unpleasant) ═══
  { id: 'anxious',      label: 'Anxious',      emoji: '\uD83E\uDEE8', quadrant: 'charged', bubbleSize: 'large',  definition: 'Racing thoughts, tightness in your body'    },  // 🫨
  { id: 'overwhelmed',  label: 'Overwhelmed',  emoji: '\uD83D\uDE2E\u200D\uD83D\uDCA8', quadrant: 'charged', bubbleSize: 'large',  definition: 'Too much at once, hard to hold it all' },  // 😮‍💨
  { id: 'frustrated',   label: 'Frustrated',   emoji: '\uD83D\uDE24', quadrant: 'charged', bubbleSize: 'medium', definition: 'Blocked, stuck, unable to move forward'      },  // 😤
  { id: 'ashamed',      label: 'Ashamed',      emoji: '\uD83E\uDEE0', quadrant: 'charged', bubbleSize: 'small',  definition: 'Shrinking, judging yourself harshly'         },  // 🫠
  { id: 'angry',        label: 'Angry',        emoji: '\uD83D\uDE21', quadrant: 'charged', bubbleSize: 'medium', definition: 'Bothered deeply, fire in your chest'         },  // 😡
  { id: 'restless',     label: 'Restless',     emoji: '\uD83D\uDCA8', quadrant: 'charged', bubbleSize: 'medium', definition: 'Unable to settle, something pulling at you'  },  // 💨
  { id: 'irritable',    label: 'Irritable',    emoji: '\uD83D\uDE12', quadrant: 'charged', bubbleSize: 'small',  definition: 'On edge, small things feel too much'         },  // 😒
  { id: 'panicked',     label: 'Panicked',     emoji: '\uD83D\uDE28', quadrant: 'charged', bubbleSize: 'small',  definition: 'Gripped by sudden fear or urgency'           },  // 😨
  { id: 'jealous',      label: 'Jealous',      emoji: '\uD83D\uDE11', quadrant: 'charged', bubbleSize: 'small',  definition: 'Wanting what someone else has'               },  // 😑

  // ═══ Tender quadrant (Low Energy + Pleasant) ═══
  { id: 'calm',         label: 'Calm',         emoji: '\uD83D\uDE0C', quadrant: 'tender',  bubbleSize: 'large',  definition: 'At ease, settled, nothing pulling at you'    },  // 😌
  { id: 'content',      label: 'Content',      emoji: '\uD83E\uDED6', quadrant: 'tender',  bubbleSize: 'large',  definition: 'Enough, just as it is'                      },  // 🫖
  { id: 'relaxed',      label: 'Relaxed',      emoji: '\uD83C\uDF3F', quadrant: 'tender',  bubbleSize: 'medium', definition: 'Loose, unhurried, body at rest'              },  // 🌿
  { id: 'serene',       label: 'Serene',       emoji: '\uD83C\uDF0A', quadrant: 'tender',  bubbleSize: 'small',  definition: 'Deeply peaceful, undisturbed'                },  // 🌊
  { id: 'peaceful',     label: 'Peaceful',     emoji: '\uD83E\uDD4A', quadrant: 'tender',  bubbleSize: 'medium', definition: 'Harmonious, at one with the moment'          },  // 🕊️
  { id: 'gentle',       label: 'Gentle',       emoji: '\uD83E\uDD8B', quadrant: 'tender',  bubbleSize: 'small',  definition: 'Soft, treating yourself with care'           },  // 🦋
  { id: 'cozy',         label: 'Cozy',         emoji: '\u2615',       quadrant: 'tender',  bubbleSize: 'small',  definition: 'Warm, safe, wrapped in comfort'              },  // ☕
  { id: 'reassured',    label: 'Reassured',    emoji: '\uD83E\uDD1D', quadrant: 'tender',  bubbleSize: 'small',  definition: 'Soothed, reminded that it will be okay'      },  // 🤝
  { id: 'thoughtful',   label: 'Thoughtful',   emoji: '\uD83E\uDD14', quadrant: 'tender',  bubbleSize: 'medium', definition: 'Reflective, turning something over quietly'  },  // 🤔

  // ═══ Deep quadrant (Low Energy + Unpleasant) ═══
  { id: 'sad',          label: 'Sad',          emoji: '\uD83E\uDD40', quadrant: 'deep',    bubbleSize: 'large',  definition: 'Heavy-hearted, something aches inside'      },  // 🥀
  { id: 'lonely',       label: 'Lonely',       emoji: '\uD83E\uDE90', quadrant: 'deep',    bubbleSize: 'medium', definition: 'Isolated, missing connection with others'    },  // 🪐
  { id: 'vulnerable',   label: 'Vulnerable',   emoji: '\uD83E\uDD8B', quadrant: 'deep',    bubbleSize: 'medium', definition: 'Exposed, open, without armor'               },  // 🦋
  { id: 'numb',         label: 'Numb',         emoji: '\uD83D\uDE36\u200D\uD83C\uDF2B\uFE0F', quadrant: 'deep', bubbleSize: 'medium', definition: 'Flat, feeling nothing at all' },  // 😶‍🌫️
  { id: 'disconnected', label: 'Detached',     emoji: '\uD83E\uDEE5', quadrant: 'deep',    bubbleSize: 'medium', definition: 'Far away, going through the motions'        },  // 🫥
  { id: 'drained',      label: 'Drained',      emoji: '\uD83D\uDD6F\uFE0F', quadrant: 'deep', bubbleSize: 'medium', definition: 'Used up, running on empty'              },  // 🕯️
  { id: 'melancholy',   label: 'Melancholy',   emoji: '\uD83C\uDF27\uFE0F', quadrant: 'deep', bubbleSize: 'small',  definition: 'A quiet, lingering sadness'             },  // 🌧️
  { id: 'exhausted',    label: 'Exhausted',    emoji: '\uD83D\uDCA4', quadrant: 'deep',    bubbleSize: 'small',  definition: 'Beyond tired, nothing left to give'         },  // 💤
  { id: 'forlorn',      label: 'Forlorn',      emoji: '\uD83C\uDF11', quadrant: 'deep',    bubbleSize: 'small',  definition: 'Feeling both sad and alone'                 },  // 🌑
  { id: 'defeated',     label: 'Defeated',     emoji: '\uD83D\uDE1E', quadrant: 'deep',    bubbleSize: 'small',  definition: 'Like you tried and it wasn\u2019t enough'   },  // 😞

  // ═══ Special (no quadrant) ═══
  { id: 'unsure',       label: 'Something unnamed', emoji: '\uD83E\uDD0D', quadrant: null, bubbleSize: null, definition: 'Hard to name right now' },  // 🤍
];

// --- Helpers ---

export const getMoodById = (id) => MOODS.find(m => m.id === id);
export const getMoodLabel = (id) => getMoodById(id)?.label || id;
export const getMoodEmoji = (id) => getMoodById(id)?.emoji || '';
export const getMoodDescription = (id) => getMoodById(id)?.definition || '';
export const getMoodQuadrant = (id) => {
  const mood = getMoodById(id);
  return mood ? QUADRANTS.find(q => q.id === mood.quadrant) : null;
};
export const getQuadrantById = (id) => QUADRANTS.find(q => q.id === id);
export const getMoodsForQuadrant = (quadrantId) => MOODS.filter(m => m.quadrant === quadrantId);

// --- Backward compatibility shims ---
// MOOD_FAMILIES maps to QUADRANTS for any remaining consumers
const QUADRANT_EMOJI = { bright: '✨', charged: '🔥', tender: '🌿', deep: '🌊' };
export const MOOD_FAMILIES = QUADRANTS.map(q => ({
  id: q.id,
  label: q.label,
  emoji: QUADRANT_EMOJI[q.id] || '',
  description: q.description,
  feelings: getMoodsForQuadrant(q.id).map(m => m.id),
}));
export const getMoodFamily = getMoodQuadrant;
export const getFamilyById = getQuadrantById;
export const getMoodsForFamily = getMoodsForQuadrant;

// --- Colors ---
// Each mood gets a color within its quadrant's warm range

export const FEELING_COLORS = {
  // Bright (amber/gold range)
  energized:    '#D4956E',
  confident:    '#C8894E',
  hopeful:      '#E0A870',
  grateful:     '#D9A060',
  excited:      '#E8B878',
  inspired:     '#CDA068',
  proud:        '#D09458',
  joyful:       '#E5B06A',
  amused:       '#DBAA72',

  // Charged (coral/terracotta range)
  anxious:      '#C17666',
  overwhelmed:  '#B86A5C',
  frustrated:   '#D08070',
  ashamed:      '#C47880',
  angry:        '#B85A50',
  restless:     '#CA7868',
  irritable:    '#D48878',
  panicked:     '#BE6658',
  jealous:      '#C87470',

  // Tender (sage/green range)
  calm:         '#8DAA82',
  content:      '#95B08A',
  relaxed:      '#A0B898',
  serene:       '#88A480',
  peaceful:     '#92AE88',
  gentle:       '#9CB894',
  cozy:         '#A4BC9C',
  reassured:    '#8CA884',
  thoughtful:   '#98B290',

  // Deep (blue/lavender range)
  sad:          '#8898B0',
  lonely:       '#9090B8',
  vulnerable:   '#9498B8',
  numb:         '#8A90A8',
  disconnected: '#7E88A0',
  drained:      '#8890A8',
  melancholy:   '#8C94B4',
  exhausted:    '#848CA4',
  forlorn:      '#8088A8',
  defeated:     '#7C84A0',

  // Special
  unsure:       '#B0AAA2',

  // V1 legacy (kept for backward compat with existing session data)
  happy:        '#FACC15',
  amazing:      '#FACC15',
  okay:         '#38BDF8',
  low:          '#94A3B8',
  struggling:   '#A78BFA',
  angry_v1:     '#EF4444',
};

export const DEFAULT_FEELING_COLOR = '#B0AAA2';

export const getFeelingColor = (id) => FEELING_COLORS[id] || DEFAULT_FEELING_COLOR;

// --- Quadrant-based sentiment ---
export const isPositiveMood = (id) => {
  const mood = getMoodById(id);
  return mood?.quadrant === 'bright' || mood?.quadrant === 'tender';
};
export const isNegativeMood = (id) => {
  const mood = getMoodById(id);
  return mood?.quadrant === 'charged' || mood?.quadrant === 'deep';
};

// --- Warm validation responses (pre-session) ---

export const MOOD_RESPONSES = {
  // Bright
  energized:    'Let that energy carry your words today.',
  confident:    'Trust that feeling. It knows you well.',
  hopeful:      'Hope is the bravest thing you can hold.',
  grateful:     'What a beautiful place to begin.',
  excited:      'That spark is already lighting the way.',
  inspired:     'You\u2019re ready to meet yourself.',
  proud:        'You\u2019ve earned the right to stand tall.',
  joyful:       'Joy deserves to be spoken aloud.',
  amused:       'Lightness is its own kind of wisdom.',

  // Charged
  anxious:      'You showed up anyway. That takes courage.',
  overwhelmed:  'You don\u2019t have to carry it all right now.',
  frustrated:   'Your feelings are asking to be heard.',
  ashamed:      'Shame shrinks in the light. You just let some in.',
  angry:        'Anger means something matters to you.',
  restless:     'Let\u2019s give that energy somewhere to go.',
  irritable:    'Even the small things are worth honoring.',
  panicked:     'You are here. You are breathing. Start there.',
  jealous:      'Wanting more for yourself isn\u2019t wrong.',

  // Tender
  calm:         'Stillness is a kind of strength.',
  content:      'There\u2019s so much wisdom in enough.',
  relaxed:      'You gave yourself permission to rest.',
  serene:       'This peace is yours. You made it.',
  peaceful:     'Being at peace takes more courage than it seems.',
  gentle:       'Gentleness is not weakness \u2014 it\u2019s depth.',
  cozy:         'You created a safe space for yourself.',
  reassured:    'Trust that knowing. It\u2019s real.',
  thoughtful:   'Reflection is the beginning of understanding.',

  // Deep
  sad:          'There is honesty in feeling this. Honor it.',
  lonely:       'You are less alone than you think.',
  vulnerable:   'It takes strength to name that.',
  numb:         'Being here when you feel nothing \u2014 that is something.',
  disconnected: 'You don\u2019t have to feel connected to show up.',
  drained:      'Even a low flame is still burning.',
  melancholy:   'There is beauty in the quiet ache.',
  exhausted:    'Rest is not giving up. It\u2019s showing up differently.',
  forlorn:      'You don\u2019t have to do this alone.',
  defeated:     'Falling down and still coming here \u2014 that\u2019s everything.',

  // Special
  unsure:       'That\u2019s okay. You\u2019re here, and that\u2019s what matters.',
};

// --- Warm validation responses (post-session) ---

export const POST_MOOD_RESPONSES = {
  // Bright
  energized:    'That\u2019s the sound of someone who showed up.',
  confident:    'You spoke your truth. That changes everything.',
  hopeful:      'You\u2019re already becoming who you\u2019re meant to be.',
  grateful:     'Gratitude after practice \u2014 that\u2019s growth.',
  excited:      'That energy? You created it.',
  inspired:     'Something inside you just woke up.',
  proud:        'You should be. You just chose yourself.',
  joyful:       'You gave yourself that joy. Remember it.',
  amused:       'Lightness after practice \u2014 that\u2019s a gift.',

  // Charged
  anxious:      'Be gentle with yourself \u2014 you just did something brave.',
  overwhelmed:  'You still came. That\u2019s more than enough.',
  frustrated:   'Friction means you\u2019re pushing against something real.',
  ashamed:      'You faced yourself in the mirror. Shame can\u2019t survive that.',
  angry:        'You held space for that fire. That\u2019s power.',
  restless:     'The stillness will come. You\u2019re closer than you think.',
  irritable:    'Showing up when it\u2019s hard counts double.',
  panicked:     'You stayed through the storm. That\u2019s courage.',
  jealous:      'Wanting more is the first step toward having it.',

  // Tender
  calm:         'You gave yourself that. Remember this feeling.',
  content:      'This is what showing up feels like.',
  relaxed:      'Your body just told you: this matters.',
  serene:       'You touched something deeper than words.',
  peaceful:     'Peace after practice \u2014 you built that.',
  gentle:       'You treated yourself with the care you deserve.',
  cozy:         'You made this space sacred. That\u2019s beautiful.',
  reassured:    'You reminded yourself of what\u2019s true.',
  thoughtful:   'That reflection is already changing you.',

  // Deep
  sad:          'Even in sadness, you chose yourself today.',
  lonely:       'You just spent time with someone who matters \u2014 you.',
  vulnerable:   'Being open is how the light gets in.',
  numb:         'Something stirred, even if you can\u2019t name it yet.',
  disconnected: 'You just reconnected with yourself, even briefly.',
  drained:      'Rest is not giving up. You showed up first.',
  melancholy:   'You held space for the ache. That takes tenderness.',
  exhausted:    'You gave what you had. That was enough.',
  forlorn:      'You were there for yourself when no one else was.',
  defeated:     'Getting back up starts with showing up. You just did.',

  // Special
  unsure:       'Sometimes the shift is deeper than words.',
};

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
