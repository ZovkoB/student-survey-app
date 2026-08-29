export const ANALYTICS_COLORS = [
  "#5c4eb4",
  "#7e70d4",
  "#a59beb",
  "#94a3b8",
  "#cbd5e1",
  "#64748b",
  "#475569",
] as const;

export const ANALYTICS_GRID_STROKE = "#e2e8f0";
export const ANALYTICS_AXIS_FILL = "#64748b";

export function formatPercentage(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatRating(value: number) {
  return value.toFixed(2);
}
