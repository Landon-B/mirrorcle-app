export const FOCUS_AREAS = [
  { id: 'self-worth', label: 'Self-Worth', emoji: '\u2B50', tagName: 'self-worth' },
  { id: 'confidence', label: 'Confidence', emoji: '\uD83D\uDC86', tagName: 'resilience' },
  { id: 'love', label: 'Love', emoji: '\u2764\uFE0F', tagName: 'gratitude' },
  { id: 'boundaries', label: 'Boundaries', emoji: '\uD83D\uDED1', tagName: 'validation' },
  { id: 'abundance', label: 'Abundance', emoji: '\uD83D\uDCB0', tagName: 'joy' },
  { id: 'healing', label: 'Healing', emoji: '\uD83C\uDF31', tagName: 'comfort' },
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
