import { isPasswordValid, validatePassword } from '../passwordValidation';

jest.mock('@/src/i18n', () => ({
  __esModule: true,
  default: {
    t: {
      bind: jest.fn(() => (key: string) => `translated_${key}`),
    },
  },
}));

describe('passwordValidation', () => {
  describe('validatePassword', () => {
    it('should validate password with all requirements met', () => {
      const password = 'SecurePass123!';

      const result = validatePassword(password);

      expect(result).toHaveLength(5);
      expect(result.every((rule) => rule.isValid)).toBe(true);
    });

    it('should return validation rules with proper structure', () => {
      const password = 'ValidPassword123!';

      const result = validatePassword(password);

      result.forEach((rule) => {
        expect(rule).toHaveProperty('key');
        expect(rule).toHaveProperty('test');
        expect(rule).toHaveProperty('text');
        expect(rule).toHaveProperty('isValid');
      });
    });

    it('should fail validation for password without uppercase', () => {
      const password = 'lowercase123!';

      const result = validatePassword(password);

      expect(result.some((rule) => rule.key === 'hasUppercase' && !rule.isValid)).toBe(true);
    });

    it('should fail validation for password without lowercase', () => {
      const password = 'UPPERCASE123!';

      const result = validatePassword(password);

      expect(result.some((rule) => rule.key === 'hasLowercase' && !rule.isValid)).toBe(true);
    });

    it('should fail validation for password without numbers', () => {
      const password = 'NoNumbers!';

      const result = validatePassword(password);

      expect(result.some((rule) => rule.key === 'hasNumber' && !rule.isValid)).toBe(true);
    });

    it('should fail validation for password without special characters', () => {
      const password = 'NoSpecial123';

      const result = validatePassword(password);

      expect(result.some((rule) => rule.key === 'hasSpecialChar' && !rule.isValid)).toBe(true);
    });

    it('should fail validation for password shorter than 8 characters', () => {
      const password = 'Short1!';

      const result = validatePassword(password);

      expect(result.some((rule) => rule.key === 'minLength' && !rule.isValid)).toBe(true);
    });

    it('should translate rule messages', () => {
      const password = 'ValidPassword123!';

      const result = validatePassword(password);

      result.forEach((rule) => {
        expect(rule.text).toContain('translated_');
      });
    });

    it('should handle edge case of exactly 8 characters', () => {
      const password = 'Pass123!';

      const result = validatePassword(password);

      expect(result.some((rule) => rule.key === 'minLength')).toBe(true);
    });

    it('should validate special characters correctly', () => {
      const validPasswords = [
        'ValidPass123!',
        'ValidPass123@',
        'ValidPass123#',
        'ValidPass123$',
        'ValidPass123%',
        'ValidPass123^',
        'ValidPass123&',
        'ValidPass123*',
      ];

      validPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.some((rule) => rule.key === 'hasSpecialChar' && rule.isValid)).toBe(true);
      });
    });

    it('should return all 5 password rules', () => {
      const password = 'AnyPassword123!';

      const result = validatePassword(password);

      expect(result.length).toBe(5);
      expect(result.map((r) => r.key)).toContain('minLength');
      expect(result.map((r) => r.key)).toContain('hasUppercase');
      expect(result.map((r) => r.key)).toContain('hasLowercase');
      expect(result.map((r) => r.key)).toContain('hasNumber');
      expect(result.map((r) => r.key)).toContain('hasSpecialChar');
    });
  });

  describe('isPasswordValid', () => {
    it('should return true for valid password', () => {
      const password = 'ValidPassword123!';

      const result = isPasswordValid(password);

      expect(result).toBe(true);
    });

    it('should return false when missing uppercase', () => {
      const password = 'validpassword123!';

      const result = isPasswordValid(password);

      expect(result).toBe(false);
    });

    it('should return false when missing lowercase', () => {
      const password = 'VALIDPASSWORD123!';

      const result = isPasswordValid(password);

      expect(result).toBe(false);
    });

    it('should return false when missing number', () => {
      const password = 'ValidPassword!';

      const result = isPasswordValid(password);

      expect(result).toBe(false);
    });

    it('should return false when missing special character', () => {
      const password = 'ValidPassword123';

      const result = isPasswordValid(password);

      expect(result).toBe(false);
    });

    it('should return false for short password', () => {
      const password = 'Short1!';

      const result = isPasswordValid(password);

      expect(result).toBe(false);
    });

    it('should return true for strong password with various special chars', () => {
      const strongPasswords = ['SecurePass123!', 'SecurePass123@', 'SecurePass123#', 'SecurePass123$'];

      strongPasswords.forEach((password) => {
        expect(isPasswordValid(password)).toBe(true);
      });
    });

    it('should return true for 8-character password meeting all requirements', () => {
      const password = 'Pass123!';

      const result = isPasswordValid(password);

      expect(result).toBe(true);
    });

    it('should return false for empty password', () => {
      const password = '';

      const result = isPasswordValid(password);

      expect(result).toBe(false);
    });
  });

  describe('password complexity', () => {
    it('should allow very long passwords', () => {
      const password = 'VeryLongPassword123!' + 'A'.repeat(100);

      const result = isPasswordValid(password);

      expect(result).toBe(true);
    });

    it('should handle passwords with multiple special characters', () => {
      const password = 'Pass123!@#$%';

      const result = isPasswordValid(password);

      expect(result).toBe(true);
    });

    it('should be case sensitive', () => {
      const password1 = 'ValidPassword123!';
      const password2 = 'validpassword123!';

      expect(isPasswordValid(password1)).toBe(true);
      expect(isPasswordValid(password2)).toBe(false);
    });
  });
});
