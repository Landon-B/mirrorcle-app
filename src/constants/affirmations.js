import { v4 as uuidv4 } from 'uuid';

export const AFFIRMATIONS = [
  { id: 'aff-001', text: "I am worthy of love and respect", colors: ["#A855F7", "#EC4899"] },
  { id: 'aff-002', text: "I am capable of achieving my dreams", colors: ["#3B82F6", "#06B6D4"] },
  { id: 'aff-003', text: "I embrace my unique journey", colors: ["#22C55E", "#10B981"] },
  { id: 'aff-004', text: "I am growing stronger every day", colors: ["#F97316", "#FACC15"] },
  { id: 'aff-005', text: "I choose to see the good in myself", colors: ["#F43F5E", "#EC4899"] },
  { id: 'aff-006', text: "I am deserving of all good things", colors: ["#6366F1", "#A855F7"] },
  { id: 'aff-007', text: "I trust my path and my timing", colors: ["#14B8A6", "#06B6D4"] },
  { id: 'aff-008', text: "I am enough exactly as I am", colors: ["#8B5CF6", "#D946EF"] },
];

export const getAffirmationById = (id) => AFFIRMATIONS.find(a => a.id === id);
