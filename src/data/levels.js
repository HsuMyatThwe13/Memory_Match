export const LEVELS = [
  { id: "low", label: "Low", pairs: 4 },
  { id: "medium", label: "Medium", pairs: 6 },
  { id: "high", label: "High", pairs: 9 },
];

export const pairsFor = (theme, level) => Math.min(level.pairs, theme.items.length);
