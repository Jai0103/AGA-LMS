export function formatPercent(value: number): string {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));
  return `${safeValue}%`;
}
