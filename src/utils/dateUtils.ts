/**
 * Formats a date string to display time in 12-hour format
 * @param dateString - ISO date string
 * @returns Time string (e.g., "10:03 AM")
 */
export const formatShortTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

/**
 * Formats a date string to display date in readable format
 * @param dateString - ISO date string
 * @returns Date string (e.g., "Oct 27, 2025")
 */
export const formatMediumDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
/**
 * Formats a date string to display date in DD/MM/YYYY format
 * @param dateString - ISO date string
 * @returns Date string (e.g., "27/10/2025")
 */
export const formatDateDDMMYYYY = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
