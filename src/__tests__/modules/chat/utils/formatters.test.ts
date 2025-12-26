import { formatMessageTime, formatRelativeTime } from '@/src/modules/chat/utils/formatters';

describe('formatters', () => {
  describe('formatMessageTime', () => {
    it('should format valid date string correctly', () => {
      const date = new Date('2023-01-01T15:45:00');
      // Mocking toLocaleTimeString can be tricky due to locale dependencies.
      // We can check if it contains expected parts or mock Date properly.
      // For simplicity, we can regex match or check specific output if we force locale.
      const result = formatMessageTime(date.toISOString());
      expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
    });

    it('should return empty string for invalid date', () => {
      expect(formatMessageTime('invalid-date')).toBe('');
    });

    it('should handle midnight correctly', () => {
      const date = new Date('2023-01-01T00:00:00');
      const result = formatMessageTime(date.toISOString());
      expect(result).toMatch(/12:00\s?AM/i);
    });

    it('should handle noon correctly', () => {
      const date = new Date('2023-01-01T12:00:00');
      const result = formatMessageTime(date.toISOString());
      expect(result).toMatch(/12:00\s?PM/i);
    });
  });

  describe('formatRelativeTime', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-05-10T12:00:00'));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should return "now" for < 1 minute', () => {
      const date = new Date('2023-05-10T11:59:30');
      expect(formatRelativeTime(date.toISOString())).toBe('now');
    });

    it('should return minutes for < 60 minutes', () => {
      const date = new Date('2023-05-10T11:30:00'); // 30 mins ago
      expect(formatRelativeTime(date.toISOString())).toBe('30m');
    });

    it('should return hours for < 24 hours', () => {
      const date = new Date('2023-05-10T09:00:00'); // 3 hours ago
      expect(formatRelativeTime(date.toISOString())).toBe('3h');
    });

    it('should return days for < 7 days', () => {
      const date = new Date('2023-05-08T12:00:00'); // 2 days ago
      expect(formatRelativeTime(date.toISOString())).toBe('2d');
    });

    it('should return full date for > 7 days', () => {
      const date = new Date('2023-04-01T12:00:00');
      // Format depends on locale, but checking if it's NOT just small unit is good
      const result = formatRelativeTime(date.toISOString());
      expect(result).toContain('/'); // Assuming default US locale like 4/1/2023
    });

    it('should return empty string for null/undefined', () => {
      expect(formatRelativeTime(null)).toBe('');
      expect(formatRelativeTime(undefined)).toBe('');
    });

    it('should return empty string for invalid date', () => {
      expect(formatRelativeTime('invalid-date')).toBe('');
    });

    it('should handle future dates by returning "now"', () => {
      const date = new Date('2023-05-10T12:05:00'); // 5 mins in future
      expect(formatRelativeTime(date.toISOString())).toBe('now');
    });

    it('should handle exact 1 minute boundary', () => {
      const date = new Date('2023-05-10T11:59:00'); // Exactly 1 min ago
      expect(formatRelativeTime(date.toISOString())).toBe('1m');
    });

    it('should handle exact 1 hour boundary', () => {
      const date = new Date('2023-05-10T11:00:00'); // Exactly 1 hour ago
      expect(formatRelativeTime(date.toISOString())).toBe('1h');
    });
  });
});
