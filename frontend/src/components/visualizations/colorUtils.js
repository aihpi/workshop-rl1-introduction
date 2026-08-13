// Shared HPI brand gradient for value heatmaps
// (Q-table now, policy-grid heatmap later)

export const HPI_VIOLET = '#7664a0';
export const HPI_ORANGE = '#ff7500';

/**
 * Interpolate between HPI violet (0.0) and HPI orange (1.0).
 */
export const getColorFromGradient = (normalizedValue) => {
  const violet = { r: 118, g: 100, b: 160 };
  const orange = { r: 255, g: 117, b: 0 };

  const r = Math.round(violet.r + (orange.r - violet.r) * normalizedValue);
  const g = Math.round(violet.g + (orange.g - violet.g) * normalizedValue);
  const b = Math.round(violet.b + (orange.b - violet.b) * normalizedValue);

  return `rgb(${r}, ${g}, ${b})`;
};
