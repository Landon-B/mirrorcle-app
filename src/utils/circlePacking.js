/**
 * Deterministic circle-packing algorithm.
 *
 * Given an array of circles with specified radii and a container size,
 * returns positioned circles that don't overlap.
 *
 * Algorithm: place largest circle at center, then iteratively place
 * remaining circles as close to center as possible without overlapping.
 *
 * @param {Array<{id: string, radius: number}>} circles
 * @param {number} containerWidth
 * @param {number} containerHeight
 * @param {number} [padding=6] - Min gap between circles
 * @returns {Array<{id: string, x: number, y: number, radius: number}>}
 */
export function packCircles(circles, containerWidth, containerHeight, padding = 6) {
  if (!circles.length) return [];

  // Sort by radius descending (place largest first)
  const sorted = [...circles].sort((a, b) => b.radius - a.radius);

  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  const placed = [];

  // Place first (largest) circle at center
  placed.push({
    id: sorted[0].id,
    x: centerX,
    y: centerY,
    radius: sorted[0].radius,
  });

  // Place remaining circles
  for (let i = 1; i < sorted.length; i++) {
    const circle = sorted[i];
    const pos = findBestPosition(circle.radius, placed, centerX, centerY, containerWidth, containerHeight, padding);
    placed.push({
      id: circle.id,
      x: pos.x,
      y: pos.y,
      radius: circle.radius,
    });
  }

  return placed;
}

/**
 * Find the best position for a new circle — as close to center as possible
 * without overlapping existing circles or going out of bounds.
 */
function findBestPosition(radius, placed, centerX, centerY, width, height, padding) {
  let bestPos = null;
  let bestDist = Infinity;

  // Try positions in expanding rings from center
  const maxDist = Math.max(width, height);
  const angleSteps = 36; // check 36 angles per ring
  const ringStep = 4;    // expand ring by 4px each step

  for (let dist = 0; dist < maxDist; dist += ringStep) {
    for (let a = 0; a < angleSteps; a++) {
      const angle = (a / angleSteps) * Math.PI * 2;
      const x = centerX + dist * Math.cos(angle);
      const y = centerY + dist * Math.sin(angle);

      // Check bounds
      if (x - radius < 0 || x + radius > width) continue;
      if (y - radius < 0 || y + radius > height) continue;

      // Check overlap with all placed circles
      let overlaps = false;
      for (const p of placed) {
        const dx = x - p.x;
        const dy = y - p.y;
        const minDist = radius + p.radius + padding;
        if (dx * dx + dy * dy < minDist * minDist) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distFromCenter < bestDist) {
          bestDist = distFromCenter;
          bestPos = { x, y };
        }
      }
    }

    // If we found a valid position in this ring, use it (greedy — closest to center)
    if (bestPos) break;
  }

  // Fallback — should never happen with reasonable inputs
  return bestPos || { x: centerX, y: centerY };
}

/**
 * Map bubble sizes to pixel radii.
 * @param {'large'|'medium'|'small'} size
 * @returns {number}
 */
export function bubbleSizeToRadius(size) {
  switch (size) {
    case 'large':  return 50;
    case 'medium': return 38;
    case 'small':  return 28;
    default:       return 38;
  }
}
