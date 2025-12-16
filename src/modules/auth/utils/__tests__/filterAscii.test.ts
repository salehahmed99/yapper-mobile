import { filterAsciiOnly } from '../filterAscii';

describe('filterAscii', () => {
  describe('filterAsciiOnly', () => {
    it('should return string unchanged if it contains only ASCII characters', () => {
      const input = 'Hello World';

      const result = filterAsciiOnly(input);

      expect(result).toBe('Hello World');
    });

    it('should remove non-ASCII characters', () => {
      const input = 'Héllo Wörld';

      const result = filterAsciiOnly(input);

      expect(result).toBe('Hllo Wrld');
    });

    it('should remove unicode characters', () => {
      const input = 'Hello 世界 World';

      const result = filterAsciiOnly(input);

      expect(result).toBe('Hello  World');
    });

    it('should remove emoji characters', () => {
      const input = 'Hello 😀 World';

      const result = filterAsciiOnly(input);

      expect(result).toBe('Hello  World');
    });

    it('should remove Arabic characters', () => {
      const input = 'Hello مرحبا World';

      const result = filterAsciiOnly(input);

      expect(result).toBe('Hello  World');
    });

    it('should handle empty string', () => {
      const input = '';

      const result = filterAsciiOnly(input);

      expect(result).toBe('');
    });

    it('should handle string with only non-ASCII characters', () => {
      const input = 'مرحبا世界';

      const result = filterAsciiOnly(input);

      expect(result).toBe('');
    });

    it('should preserve numbers and special ASCII characters', () => {
      const input = 'Test123!@#$%^&*()';

      const result = filterAsciiOnly(input);

      expect(result).toBe('Test123!@#$%^&*()');
    });

    it('should preserve whitespace', () => {
      const input = 'Hello\nWorld\tTest';

      const result = filterAsciiOnly(input);

      expect(result).toBe('Hello\nWorld\tTest');
    });

    it('should handle mixed ASCII and non-ASCII', () => {
      const input = 'User_123_ñoño_test';

      const result = filterAsciiOnly(input);

      expect(result).toBe('User_123_oo_test');
    });

    it('should remove accented characters', () => {
      const input = 'café résumé naïve';

      const result = filterAsciiOnly(input);

      expect(result).toBe('caf rsum nave');
    });

    it('should remove diacritical marks', () => {
      const input = 'à á â ã ä å';

      const result = filterAsciiOnly(input);

      expect(result).toBe('     ');
    });

    it('should keep ASCII control characters', () => {
      const input = 'Hello\x00World';

      const result = filterAsciiOnly(input);

      expect(result).toBe('Hello\x00World');
    });

    it('should handle very long strings', () => {
      const asciiPart = 'a'.repeat(1000);
      const input = asciiPart + '你好' + asciiPart;

      const result = filterAsciiOnly(input);

      expect(result).toBe(asciiPart + asciiPart);
      expect(result.length).toBe(2000);
    });

    it('should be idempotent', () => {
      const input = 'Héllo Wörld';

      const result1 = filterAsciiOnly(input);
      const result2 = filterAsciiOnly(result1);

      expect(result1).toBe(result2);
    });
  });
});
