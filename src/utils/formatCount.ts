/**
 * Formats a count number to display like Twitter
 * - Less than 1000: display as is (e.g., "5", "99")
 * - Thousands: display with K (e.g., "1.2K", "67.8K")
 * - Millions: display with M (e.g., "1.1M", "45.3M")
 * - Billions: display with B (e.g., "2.5B")
 */
export const formatCount = (count: number): string => {
  if (count < 1000) {
    return count.toString();
  }

  if (count < 1_000_000) {
    const thousands = count / 1000;
    // Show one decimal place if needed, otherwise show as integer
    return thousands % 1 === 0 ? `${Math.floor(thousands)}K` : `${thousands.toFixed(1)}K`;
  }

  if (count < 1_000_000_000) {
    const millions = count / 1_000_000;
    return millions % 1 === 0 ? `${Math.floor(millions)}M` : `${millions.toFixed(1)}M`;
  }

  const billions = count / 1_000_000_000;
  return billions % 1 === 0 ? `${Math.floor(billions)}B` : `${billions.toFixed(1)}B`;
};
