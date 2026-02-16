export const AFFIRMATIONS = [
  { id: 'aff-001', text: "I am worthy of love and respect" },
  { id: 'aff-002', text: "I am capable of achieving my dreams" },
  { id: 'aff-003', text: "I embrace my unique journey" },
  { id: 'aff-004', text: "I am growing stronger every day" },
  { id: 'aff-005', text: "I choose to see the good in myself" },
  { id: 'aff-006', text: "I am deserving of all good things" },
  { id: 'aff-007', text: "I trust my path and my timing" },
  { id: 'aff-008', text: "I am enough exactly as I am" },
];

export const getAffirmationById = (id) => AFFIRMATIONS.find(a => a.id === id);
