/**
 * Formats a count number to display like Twitter
 * - Less than 1000: display as is (e.g., "5", "99")
 * - Thousands: display with K (e.g., "1.2K", "67.8K")
 * - Millions: display with M (e.g., "1.1M", "45.3M")
 * - Billions: display with B (e.g., "2.5B")
 */
export const formatCount = (count: number): string => {
  const isNegative = count < 0;
  const absCount = Math.abs(count);
  const prefix = isNegative ? '-' : '';

  if (absCount < 1000) {
    return count.toString();
  }

  const formatNumber = (value: number, suffix: string): string => {
    const rounded = Math.round(value * 10) / 10;
    const formatted = rounded % 1 === 0 ? Math.floor(rounded).toString() : rounded.toFixed(1);
    return `${prefix}${formatted}${suffix}`;
  };

  if (absCount < 1_000_000) {
    return formatNumber(absCount / 1000, 'K');
  }

  if (absCount < 1_000_000_000) {
    return formatNumber(absCount / 1_000_000, 'M');
  }

  return formatNumber(absCount / 1_000_000_000, 'B');
};
