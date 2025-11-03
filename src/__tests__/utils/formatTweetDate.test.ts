import { formatTweetDate } from '@/src/utils/formatTweetDate';

describe('formatTweetDate', () => {
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  describe('Recent timestamps', () => {
    it('should return "now" for timestamps less than a minute ago', () => {
      const now = new Date();
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);

      expect(formatTweetDate(thirtySecondsAgo.toISOString())).toBe('now');
    });

    it('should return "now" for current timestamp', () => {
      const now = new Date();

      expect(formatTweetDate(now.toISOString())).toBe('now');
    });
  });

  describe('Minutes ago', () => {
    it('should return minutes for timestamps less than an hour ago', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * MINUTE);

      expect(formatTweetDate(fiveMinutesAgo.toISOString())).toBe('5m');
    });

    it('should return "1m" for one minute ago', () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - MINUTE);

      expect(formatTweetDate(oneMinuteAgo.toISOString())).toBe('1m');
    });

    it('should return "59m" for 59 minutes ago', () => {
      const now = new Date();
      const fiftyNineMinutesAgo = new Date(now.getTime() - 59 * MINUTE);

      expect(formatTweetDate(fiftyNineMinutesAgo.toISOString())).toBe('59m');
    });
  });

  describe('Hours ago', () => {
    it('should return hours for timestamps less than a day ago', () => {
      const now = new Date();
      const threeHoursAgo = new Date(now.getTime() - 3 * HOUR);

      expect(formatTweetDate(threeHoursAgo.toISOString())).toBe('3h');
    });

    it('should return "1h" for one hour ago', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - HOUR);

      expect(formatTweetDate(oneHourAgo.toISOString())).toBe('1h');
    });

    it('should return "23h" for 23 hours ago', () => {
      const now = new Date();
      const twentyThreeHoursAgo = new Date(now.getTime() - 23 * HOUR);

      expect(formatTweetDate(twentyThreeHoursAgo.toISOString())).toBe('23h');
    });
  });

  describe('Days ago', () => {
    it('should return days for timestamps less than a week ago', () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * DAY);

      expect(formatTweetDate(threeDaysAgo.toISOString())).toBe('3d');
    });

    it('should return "1d" for one day ago', () => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - DAY);

      expect(formatTweetDate(oneDayAgo.toISOString())).toBe('1d');
    });

    it('should return "6d" for 6 days ago', () => {
      const now = new Date();
      const sixDaysAgo = new Date(now.getTime() - 6 * DAY);

      expect(formatTweetDate(sixDaysAgo.toISOString())).toBe('6d');
    });
  });

  describe('Full date format', () => {
    it('should return DD/MM/YYYY for timestamps older than a week', () => {
      const now = new Date();
      const tenDaysAgo = new Date(now.getTime() - 10 * DAY);

      const result = formatTweetDate(tenDaysAgo.toISOString());
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it('should format specific date correctly', () => {
      // January 15, 2025
      const specificDate = new Date('2025-01-15T12:00:00.000Z');

      const result = formatTweetDate(specificDate.toISOString());
      expect(result).toMatch(/15\/01\/2025/);
    });

    it('should pad single digit days and months with zero', () => {
      // March 5, 2025
      const specificDate = new Date('2025-03-05T12:00:00.000Z');

      const result = formatTweetDate(specificDate.toISOString());
      expect(result).toMatch(/05\/03\/2025/);
    });
  });

  describe('Edge cases', () => {
    it('should handle timestamps exactly at boundaries', () => {
      const now = new Date();

      // Exactly 60 seconds ago (should be 1m, not now)
      const exactlyOneMinute = new Date(now.getTime() - 60 * 1000);
      expect(formatTweetDate(exactlyOneMinute.toISOString())).toBe('1m');

      // Exactly 60 minutes ago (should be 1h)
      const exactlyOneHour = new Date(now.getTime() - 60 * MINUTE);
      expect(formatTweetDate(exactlyOneHour.toISOString())).toBe('1h');

      // Exactly 24 hours ago (should be 1d)
      const exactlyOneDay = new Date(now.getTime() - 24 * HOUR);
      expect(formatTweetDate(exactlyOneDay.toISOString())).toBe('1d');
    });

    it('should handle very old dates', () => {
      const veryOldDate = new Date('2020-01-01T00:00:00.000Z');

      const result = formatTweetDate(veryOldDate.toISOString());
      expect(result).toMatch(/^\d{2}\/\d{2}\/2020$/);
    });

    it('should handle different date formats', () => {
      const date = new Date(2025, 0, 15, 12, 0, 0); // January 15, 2025 (old enough to show full date)

      const result = formatTweetDate(date.toISOString());
      // Should show full date since it's more than 7 days old
      expect(result).toMatch(/^\d{2}\/\d{2}\/2025$/);
    });
  });
});
