/**
 * Warm card gradient palette — earthy tones that align with the v2 warm light theme.
 * Used instead of per-affirmation neon colors for visual cohesion.
 */
export const CARD_GRADIENTS = [
  ['#C17666', '#D4956E'], // Terracotta
  ['#B8847B', '#D4A898'], // Clay
  ['#C9A87C', '#DFC9A0'], // Sand
  ['#8FA68E', '#B0C4A8'], // Sage
  ['#9B8AA0', '#BCA8BF'], // Dusk
  ['#8E8A85', '#AFA9A3'], // Stone
  ['#C4918A', '#DCAEA6'], // Blush
  ['#A67B5B', '#C9A07E'], // Sienna
];

/**
 * Get a warm gradient pair by index (cycles through the palette).
 * @param {number} index
 * @returns {string[]} [startColor, endColor]
 */
export const getCardColors = (index) =>
  CARD_GRADIENTS[Math.abs(index) % CARD_GRADIENTS.length];
