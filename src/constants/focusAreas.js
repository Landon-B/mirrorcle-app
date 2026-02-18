export const FOCUS_AREAS = [
  { id: 'self-worth',  label: 'Self-Worth',  emoji: '\uD83D\uDC9B',      tagName: 'self-worth' },   // 💛
  { id: 'confidence',  label: 'Confidence',  emoji: '\uD83E\uDD81',      tagName: 'resilience' },   // 🦁
  { id: 'love',        label: 'Love',        emoji: '\uD83E\uDEC2',      tagName: 'gratitude' },    // 🫂
  { id: 'boundaries',  label: 'Boundaries',  emoji: '\uD83E\uDEB7',      tagName: 'validation' },   // 🪷
  { id: 'abundance',   label: 'Abundance',   emoji: '\uD83C\uDF3B',      tagName: 'joy' },          // 🌻
  { id: 'healing',     label: 'Healing',     emoji: '\uD83C\uDF31',      tagName: 'comfort' },      // 🌱
  { id: 'letting-go',  label: 'Letting Go',  emoji: '\uD83C\uDF42',      tagName: 'peace' },        // 🍂
  { id: 'presence',    label: 'Presence',    emoji: '\uD83E\uDEE7',      tagName: 'peace' },        // 🫧
  { id: 'forgiveness', label: 'Forgiveness', emoji: '\uD83D\uDD4A\uFE0F', tagName: 'comfort' },     // 🕊️
];

export const getFocusAreaById = (id) => FOCUS_AREAS.find(f => f.id === id);

// Tag UUIDs from seed migration (20240209000003_seed_initial_data.sql)
export const TAG_IDS = {
  'self-worth': '00000000-0000-0000-0000-000000000001',
  'growth':     '00000000-0000-0000-0000-000000000002',
  'gratitude':  '00000000-0000-0000-0000-000000000003',
  'comfort':    '00000000-0000-0000-0000-000000000004',
  'validation': '00000000-0000-0000-0000-000000000005',
  'resilience': '00000000-0000-0000-0000-000000000006',
  'joy':        '00000000-0000-0000-0000-000000000007',
  'peace':      '00000000-0000-0000-0000-000000000008',
};

export const getFocusTagId = (focusAreaId) => {
  const area = FOCUS_AREAS.find(f => f.id === focusAreaId);
  return area?.tagName ? TAG_IDS[area.tagName] : null;
};
