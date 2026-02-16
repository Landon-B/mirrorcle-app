export const FOCUS_AREAS = [
  { id: 'self-worth', label: 'Self-Worth', emoji: '\u2B50', tagName: 'self-worth' },
  { id: 'confidence', label: 'Confidence', emoji: '\uD83D\uDC86', tagName: 'resilience' },
  { id: 'love', label: 'Love', emoji: '\u2764\uFE0F', tagName: 'gratitude' },
  { id: 'boundaries', label: 'Boundaries', emoji: '\uD83D\uDED1', tagName: 'validation' },
  { id: 'abundance', label: 'Abundance', emoji: '\uD83D\uDCB0', tagName: 'joy' },
  { id: 'healing', label: 'Healing', emoji: '\uD83C\uDF31', tagName: 'comfort' },
];

export const getFocusAreaById = (id) => FOCUS_AREAS.find(f => f.id === id);
