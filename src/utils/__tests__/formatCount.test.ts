import { toLocalizedNumber } from '@/src/i18n';
import { formatCount } from '../formatCount';

jest.mock('@/src/i18n', () => ({
  toLocalizedNumber: jest.fn((val: string) => val),
}));

describe('formatCount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('numbers less than 1000', () => {
    it('should format small numbers as is', () => {
      expect(formatCount(0)).toBe('0');
      expect(formatCount(1)).toBe('1');
      expect(formatCount(5)).toBe('5');
      expect(formatCount(99)).toBe('99');
      expect(formatCount(999)).toBe('999');
    });

    it('should handle negative small numbers', () => {
      expect(formatCount(-1)).toBe('-1');
      expect(formatCount(-99)).toBe('-99');
      expect(formatCount(-999)).toBe('-999');
    });
  });

  describe('numbers in thousands', () => {
    it('should format thousands with K suffix', () => {
      expect(formatCount(1000)).toBe('1K');
      expect(formatCount(1234)).toBe('1.2K');
      expect(formatCount(5000)).toBe('5K');
      expect(formatCount(9999)).toBe('10K');
    });

    it('should format decimal thousands correctly', () => {
      expect(formatCount(1500)).toBe('1.5K');
      expect(formatCount(67890)).toBe('67.9K');
      expect(formatCount(12345)).toBe('12.3K');
    });

    it('should handle negative thousands', () => {
      expect(formatCount(-1000)).toBe('-1K');
      expect(formatCount(-1234)).toBe('-1.2K');
      expect(formatCount(-5000)).toBe('-5K');
    });
  });

  describe('numbers in millions', () => {
    it('should format millions with M suffix', () => {
      expect(formatCount(1000000)).toBe('1M');
      expect(formatCount(1234567)).toBe('1.2M');
      expect(formatCount(5000000)).toBe('5M');
      expect(formatCount(99999999)).toBe('100M');
    });

    it('should format decimal millions correctly', () => {
      expect(formatCount(1500000)).toBe('1.5M');
      expect(formatCount(45300000)).toBe('45.3M');
      expect(formatCount(12340000)).toBe('12.3M');
    });

    it('should handle negative millions', () => {
      expect(formatCount(-1000000)).toBe('-1M');
      expect(formatCount(-1234567)).toBe('-1.2M');
      expect(formatCount(-5000000)).toBe('-5M');
    });
  });

  describe('numbers in billions', () => {
    it('should format billions with B suffix', () => {
      expect(formatCount(1000000000)).toBe('1B');
      expect(formatCount(2500000000)).toBe('2.5B');
      expect(formatCount(5000000000)).toBe('5B');
    });

    it('should format decimal billions correctly', () => {
      expect(formatCount(1234567890)).toBe('1.2B');
      expect(formatCount(45300000000)).toBe('45.3B');
    });

    it('should handle negative billions', () => {
      expect(formatCount(-1000000000)).toBe('-1B');
      expect(formatCount(-2500000000)).toBe('-2.5B');
      expect(formatCount(-5000000000)).toBe('-5B');
    });

    it('should format very large numbers', () => {
      expect(formatCount(999999999999)).toBe('1000B');
      expect(formatCount(9999999999999)).toBe('10000B');
    });
  });

  describe('boundary values', () => {
    it('should handle boundary between formats', () => {
      expect(formatCount(999)).toBe('999');
      expect(formatCount(1000)).toBe('1K');

      expect(formatCount(999999)).toBe('1000K');
      expect(formatCount(1000000)).toBe('1M');

      expect(formatCount(999999999)).toBe('1000M');
      expect(formatCount(1000000000)).toBe('1B');
    });
  });

  describe('rounding behavior', () => {
    it('should round correctly to 1 decimal place', () => {
      expect(formatCount(1449)).toBe('1.4K'); // 1.449 rounds to 1.4
      expect(formatCount(1450)).toBe('1.5K'); // 1.450 rounds to 1.5
      expect(formatCount(1549)).toBe('1.5K'); // 1.549 rounds to 1.5
      expect(formatCount(1550)).toBe('1.6K'); // 1.550 rounds to 1.6
    });

    it('should remove decimal point for whole numbers', () => {
      expect(formatCount(1000)).toBe('1K');
      expect(formatCount(2000)).toBe('2K');
      expect(formatCount(5000000)).toBe('5M');
    });
  });

  describe('localization', () => {
    it('should call toLocalizedNumber with formatted value', () => {
      const mockLocalized = toLocalizedNumber as jest.Mock;

      formatCount(1234);

      expect(mockLocalized).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle zero', () => {
      expect(formatCount(0)).toBe('0');
    });

    it('should handle very small negative numbers', () => {
      expect(formatCount(-0.5)).toBe('-0.5');
    });

    it('should handle floating point inputs', () => {
      expect(formatCount(1234.5)).toBe('1.2K');
      expect(formatCount(1000.1)).toBe('1K');
    });
  });
});
