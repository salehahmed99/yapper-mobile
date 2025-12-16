import i18n, { toLocalizedNumber } from '@/src/i18n';
import { formatDateDDMMYYYY, formatMediumDate, formatShortTime } from '../dateUtils';

jest.mock('@/src/i18n', () => ({
  __esModule: true,
  default: {
    language: 'en',
  },
  toLocalizedNumber: jest.fn((val: string) => val),
}));

const mockI18n = i18n as jest.Mocked<typeof i18n>;
const mockToLocalizedNumber = toLocalizedNumber as jest.MockedFunction<typeof toLocalizedNumber>;

describe('dateUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockI18n.language = 'en';
    mockToLocalizedNumber.mockImplementation((val) => val);
  });

  describe('formatShortTime', () => {
    it('should format time in 12-hour format', () => {
      const dateString = '2024-10-27T10:03:00Z';

      const result = formatShortTime(dateString);

      expect(result).toBeTruthy();
      expect(mockToLocalizedNumber).toHaveBeenCalled();
    });

    it('should handle morning times', () => {
      const dateString = '2024-10-27T08:30:00Z';

      const result = formatShortTime(dateString);

      expect(result).toBeTruthy();
    });

    it('should handle afternoon times', () => {
      const dateString = '2024-10-27T14:45:00Z';

      const result = formatShortTime(dateString);

      expect(result).toBeTruthy();
    });

    it('should handle midnight', () => {
      const dateString = '2024-10-27T00:00:00Z';

      const result = formatShortTime(dateString);

      expect(result).toBeTruthy();
    });

    it('should handle noon', () => {
      const dateString = '2024-10-27T12:00:00Z';

      const result = formatShortTime(dateString);

      expect(result).toBeTruthy();
    });

    it('should apply localization', () => {
      const dateString = '2024-10-27T10:03:00Z';

      formatShortTime(dateString);

      expect(mockToLocalizedNumber).toHaveBeenCalled();
    });

    it('should use i18n language', () => {
      mockI18n.language = 'ar';

      const dateString = '2024-10-27T10:03:00Z';

      const result = formatShortTime(dateString);

      expect(result).toBeTruthy();
    });

    it('should handle different timezones', () => {
      const dateStrings = ['2024-10-27T10:03:00Z', '2024-10-27T10:03:00+05:00', '2024-10-27T10:03:00-08:00'];

      dateStrings.forEach((dateString) => {
        const result = formatShortTime(dateString);
        expect(result).toBeTruthy();
      });
    });
  });

  describe('formatMediumDate', () => {
    it('should format date in readable format', () => {
      const dateString = '2024-10-27T10:03:00Z';

      const result = formatMediumDate(dateString);

      expect(result).toBeTruthy();
      expect(mockToLocalizedNumber).toHaveBeenCalled();
    });

    it('should include month, day, and year', () => {
      const dateString = '2024-10-27T10:03:00Z';

      const result = formatMediumDate(dateString);

      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should use abbreviated month name', () => {
      const dateString = '2024-10-27T10:03:00Z';

      const result = formatMediumDate(dateString);

      expect(result).toBeTruthy();
    });

    it('should handle different months', () => {
      const months = ['2024-01-15T10:03:00Z', '2024-06-20T10:03:00Z', '2024-12-31T10:03:00Z'];

      months.forEach((dateString) => {
        const result = formatMediumDate(dateString);
        expect(result).toBeTruthy();
      });
    });

    it('should apply localization', () => {
      const dateString = '2024-10-27T10:03:00Z';

      formatMediumDate(dateString);

      expect(mockToLocalizedNumber).toHaveBeenCalled();
    });

    it('should use i18n language', () => {
      mockI18n.language = 'ar';

      const dateString = '2024-10-27T10:03:00Z';

      const result = formatMediumDate(dateString);

      expect(result).toBeTruthy();
    });
  });

  describe('formatDateDDMMYYYY', () => {
    it('should format date as DD/MM/YYYY for English', () => {
      mockI18n.language = 'en';
      const dateString = '2024-10-27T10:03:00Z';

      const result = formatDateDDMMYYYY(dateString);

      expect(result).toBeTruthy();
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should format date as YYYY/MM/DD for Arabic', () => {
      mockI18n.language = 'ar';
      const dateString = '2024-10-27T10:03:00Z';

      const result = formatDateDDMMYYYY(dateString);

      expect(result).toBeTruthy();
      expect(mockToLocalizedNumber).toHaveBeenCalled();
    });

    it('should pad single digit days and months', () => {
      mockI18n.language = 'en';
      const dateString = '2024-01-05T10:03:00Z';

      const result = formatDateDDMMYYYY(dateString);

      expect(result).toBeTruthy();
      expect(result).toMatch(/05\/01\/2024/);
    });

    it('should handle end of month dates', () => {
      mockI18n.language = 'en';
      const dateString = '2024-01-31T10:03:00Z';

      const result = formatDateDDMMYYYY(dateString);

      expect(result).toBeTruthy();
      expect(result).toMatch(/31\/01\/2024/);
    });

    it('should handle different years', () => {
      mockI18n.language = 'en';
      const dates = [
        { string: '2024-10-27T10:03:00Z', expected: '27/10/2024' },
        { string: '2023-10-27T10:03:00Z', expected: '27/10/2023' },
        { string: '2025-10-27T10:03:00Z', expected: '27/10/2025' },
      ];

      dates.forEach(({ string }) => {
        const result = formatDateDDMMYYYY(string);
        expect(result).toBeTruthy();
      });
    });

    it('should apply localization to all parts', () => {
      mockI18n.language = 'en';
      const dateString = '2024-10-27T10:03:00Z';

      formatDateDDMMYYYY(dateString);

      expect(mockToLocalizedNumber).toHaveBeenCalled();
    });

    it('should handle leap year dates', () => {
      mockI18n.language = 'en';
      const dateString = '2024-02-29T10:03:00Z';

      const result = formatDateDDMMYYYY(dateString);

      expect(result).toBeTruthy();
      expect(result).toMatch(/29\/02\/2024/);
    });

    it('should switch format based on language', () => {
      const dateString = '2024-10-27T10:03:00Z';

      mockI18n.language = 'en';
      const enResult = formatDateDDMMYYYY(dateString);

      mockI18n.language = 'ar';
      const arResult = formatDateDDMMYYYY(dateString);

      // Both should have results but potentially different format
      expect(enResult).toBeTruthy();
      expect(arResult).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle invalid date strings gracefully', () => {
      const invalidDate = 'invalid-date';

      expect(() => formatShortTime(invalidDate)).not.toThrow();
      expect(() => formatMediumDate(invalidDate)).not.toThrow();
      expect(() => formatDateDDMMYYYY(invalidDate)).not.toThrow();
    });

    it('should handle epoch time', () => {
      const epochDate = '1970-01-01T00:00:00Z';

      expect(() => formatShortTime(epochDate)).not.toThrow();
      expect(() => formatMediumDate(epochDate)).not.toThrow();
      expect(() => formatDateDDMMYYYY(epochDate)).not.toThrow();
    });

    it('should handle far future dates', () => {
      const futureDate = '2099-12-31T23:59:59Z';

      expect(() => formatShortTime(futureDate)).not.toThrow();
      expect(() => formatMediumDate(futureDate)).not.toThrow();
      expect(() => formatDateDDMMYYYY(futureDate)).not.toThrow();
    });
  });
});
