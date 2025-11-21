import { formatDateDDMMYYYY } from '../../../utils/dateUtils';

/**
 * Formats a tweet creation date to display like Twitter
 * - Less than 1 minute: "now"
 * - Less than 1 hour: "Xm" (e.g., "5m")
 * - Less than 24 hours: "Xh" (e.g., "3h")
 * - Less than 7 days: "Xd" (e.g., "2d")
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
    return 'now';
  }

  // Less than 1 hour
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  // Less than 24 hours
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }

  // Less than 7 days
  if (diffInDays < 7) {
    return `${diffInDays}d`;
  }

  // Older than 7 days - return formatted date
  return formatDateDDMMYYYY(dateString);
};
