/**
 * Format a number in compact notation: M for millions, K for thousands.
 * No currency symbol. Clean, international.
 * Examples: 1500000 → "1.50M", 85000 → "85.0K", 500 → "500"
 */
export function fmtMoney(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '0';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(2)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(1)}K`;
  }
  return `${sign}${Math.round(abs).toLocaleString()}`;
}
