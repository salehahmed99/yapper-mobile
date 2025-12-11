import i18n, { toLocalizedNumber } from '@/src/i18n';
import { formatDateDDMMYYYY } from '../../../utils/dateUtils';

/**
 * Formats a tweet creation date to display like Twitter
 * - Less than 1 minute: "now" / "الآن"
 * - Less than 1 hour: "Xm" / "Xد" (e.g., "5m" / "٥د")
 * - Less than 24 hours: "Xh" / "Xس" (e.g., "3h" / "٣س")
 * - Less than 7 days: "Xd" / "Xي" (e.g., "2d" / "٢ي")
 * - Older than 7 days: "DD/MM/YYYY"
 */
export const formatTweetDate = (dateString: string): string => {
  const now = new Date();
  const tweetDate = new Date(dateString);
  const diffInMs = now.getTime() - tweetDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // Less than 1 minute
  if (diffInSeconds < 60) {
    return i18n.t('tweets.date.now');
  }

  // Less than 1 hour
  if (diffInMinutes < 60) {
    return `${toLocalizedNumber(diffInMinutes.toString())}${i18n.t('tweets.date.minutesShort')}`;
  }

  // Less than 24 hours
  if (diffInHours < 24) {
    return `${toLocalizedNumber(diffInHours.toString())}${i18n.t('tweets.date.hoursShort')}`;
  }

  // Less than 7 days
  if (diffInDays < 7) {
    return `${toLocalizedNumber(diffInDays.toString())}${i18n.t('tweets.date.daysShort')}`;
  }

  // Older than 7 days - return formatted date
  return formatDateDDMMYYYY(dateString);
};
