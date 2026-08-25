export const ANALYTICS_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#16a34a",
  "#0891b2",
  "#ca8a04",
  "#dc2626",
] as const;

export function formatPercentage(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatRating(value: number) {
  return value.toFixed(2);
}
