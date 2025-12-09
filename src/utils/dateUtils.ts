import i18n, { toLocalizedNumber } from '../i18n';

/**
 * Formats a date string to display time in 12-hour format
 * @param dateString - ISO date string
 * @returns Time string (e.g., "10:03 AM")
 */
export const formatShortTime = (dateString: string): string => {
  const date = new Date(dateString);
  const locale = i18n.language;
  const formattedTime = date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', hour12: true });
  return toLocalizedNumber(formattedTime);
};

/**
 * Formats a date string to display date in readable format
 * @param dateString - ISO date string
 * @returns Date string (e.g., "Oct 27, 2025")
 */
export const formatMediumDate = (dateString: string): string => {
  const date = new Date(dateString);
  const locale = i18n.language;
  const formattedDate = date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
  return toLocalizedNumber(formattedDate);
};
/**
 * Formats a date string to display date in DD/MM/YYYY format
 * @param dateString - ISO date string
 * @returns Date string (e.g., "27/10/2025")
 */
export const formatDateDDMMYYYY = (dateString: string): string => {
  const date = new Date(dateString);
  const day = toLocalizedNumber(String(date.getDate()).padStart(2, '0'));
  const month = toLocalizedNumber(String(date.getMonth() + 1).padStart(2, '0'));
  const year = toLocalizedNumber(String(date.getFullYear()));

  if (i18n.language === 'ar') {
    return `${year}/${month}/${day}`;
  }

  return `${day}/${month}/${year}`;
};
