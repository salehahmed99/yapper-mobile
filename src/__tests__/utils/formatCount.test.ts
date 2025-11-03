import { formatCount } from '@/src/utils/formatCount';

describe('formatCount', () => {
  describe('Small numbers (< 1000)', () => {
    it('should return number as string for values less than 100', () => {
      expect(formatCount(0)).toBe('0');
      expect(formatCount(5)).toBe('5');
      expect(formatCount(42)).toBe('42');
      expect(formatCount(99)).toBe('99');
    });

    it('should return number as string for values between 100-999', () => {
      expect(formatCount(100)).toBe('100');
      expect(formatCount(500)).toBe('500');
      expect(formatCount(999)).toBe('999');
    });
  });

  describe('Thousands (K)', () => {
    it('should format thousands with K suffix', () => {
      expect(formatCount(1000)).toBe('1K');
      expect(formatCount(1500)).toBe('1.5K');
      expect(formatCount(2300)).toBe('2.3K');
      expect(formatCount(10000)).toBe('10K');
    });

    it('should handle edge cases for thousands', () => {
      expect(formatCount(1001)).toBe('1K');
      expect(formatCount(999999)).toBe('1000K');
    });

    it('should format decimal thousands correctly', () => {
      expect(formatCount(1200)).toBe('1.2K');
      expect(formatCount(67800)).toBe('67.8K');
      expect(formatCount(123400)).toBe('123.4K');
    });
  });

  describe('Millions (M)', () => {
    it('should format millions with M suffix', () => {
      expect(formatCount(1000000)).toBe('1M');
      expect(formatCount(1100000)).toBe('1.1M');
      expect(formatCount(2500000)).toBe('2.5M');
      expect(formatCount(45300000)).toBe('45.3M');
    });

    it('should handle edge cases for millions', () => {
      expect(formatCount(1000001)).toBe('1M');
      expect(formatCount(999999999)).toBe('1000M');
    });

    it('should format decimal millions correctly', () => {
      expect(formatCount(1200000)).toBe('1.2M');
      expect(formatCount(10500000)).toBe('10.5M');
    });
  });

  describe('Billions (B)', () => {
    it('should format billions with B suffix', () => {
      expect(formatCount(1000000000)).toBe('1B');
      expect(formatCount(2500000000)).toBe('2.5B');
      expect(formatCount(10000000000)).toBe('10B');
    });

    it('should format decimal billions correctly', () => {
      expect(formatCount(1200000000)).toBe('1.2B');
      expect(formatCount(3700000000)).toBe('3.7B');
    });
  });

  describe('Integer values (no decimals)', () => {
    it('should not show decimal for whole thousands', () => {
      expect(formatCount(2000)).toBe('2K');
      expect(formatCount(5000)).toBe('5K');
      expect(formatCount(100000)).toBe('100K');
    });

    it('should not show decimal for whole millions', () => {
      expect(formatCount(3000000)).toBe('3M');
      expect(formatCount(10000000)).toBe('10M');
    });

    it('should not show decimal for whole billions', () => {
      expect(formatCount(2000000000)).toBe('2B');
      expect(formatCount(5000000000)).toBe('5B');
    });
  });

  describe('Edge cases', () => {
    it('should handle negative numbers', () => {
      expect(formatCount(-1)).toBe('-1');
      expect(formatCount(-1000)).toBe('-1K');
      expect(formatCount(-1500)).toBe('-1.5K');
    });

    it('should handle very large numbers', () => {
      expect(formatCount(999999999999)).toBe('1000B');
      expect(formatCount(1500000000000)).toBe('1500B');
    });

    it('should handle decimal precision correctly', () => {
      expect(formatCount(1550)).toBe('1.6K'); // Rounded up
      expect(formatCount(1540)).toBe('1.5K');
      expect(formatCount(1549)).toBe('1.5K');
    });
  });
});
