import { useForgotPasswordStore } from '../../../modules/auth/store/useForgetPasswordStore';
import { act, renderHook } from '@testing-library/react-native';

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: () => [{ regionCode: 'US' }],
}));

// Mock schemas
jest.mock('../../../modules/auth/schemas/schemas', () => ({
  emailSchema: {
    safeParse: jest.fn(),
  },
  phoneSchema: {
    safeParse: jest.fn(),
  },
  usernameSchema: {
    safeParse: jest.fn(),
  },
}));

// Mock libphonenumber-js
jest.mock('libphonenumber-js/max', () => ({
  parsePhoneNumberFromString: jest.fn(),
}));

import { emailSchema, phoneSchema, usernameSchema } from '../../../modules/auth/schemas/schemas';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

describe('useForgotPasswordStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { result } = renderHook(() => useForgotPasswordStore());
    act(() => {
      result.current.reset();
    });
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useForgotPasswordStore());

    expect(result.current.identifier).toBe('');
    expect(result.current.textType).toBe(null);
    expect(result.current.resetToken).toBe('');
  });

  describe('setIdentifier', () => {
    it('sets identifier correctly', () => {
      const { result } = renderHook(() => useForgotPasswordStore());

      act(() => {
        result.current.setIdentifier('test@example.com');
      });

      expect(result.current.identifier).toBe('test@example.com');
    });
  });

  describe('setResetToken', () => {
    it('sets reset token correctly', () => {
      const { result } = renderHook(() => useForgotPasswordStore());

      act(() => {
        result.current.setResetToken('reset-token-123');
      });

      expect(result.current.resetToken).toBe('reset-token-123');
    });
  });

  describe('detectTextType', () => {
    it('detects email correctly', () => {
      (emailSchema.safeParse as jest.Mock).mockReturnValue({ success: true });
      (phoneSchema.safeParse as jest.Mock).mockReturnValue({ success: false });
      (usernameSchema.safeParse as jest.Mock).mockReturnValue({ success: false });
      (parsePhoneNumberFromString as jest.Mock).mockReturnValue(null);

      const { result } = renderHook(() => useForgotPasswordStore());

      let detectedType: string | null = null;
      act(() => {
        detectedType = result.current.detectTextType('test@example.com');
      });

      expect(detectedType).toBe('email');
      expect(result.current.textType).toBe('email');
      expect(emailSchema.safeParse).toHaveBeenCalledWith('test@example.com');
    });

    it('detects phone number correctly', () => {
      (emailSchema.safeParse as jest.Mock).mockReturnValue({ success: false });
      (phoneSchema.safeParse as jest.Mock).mockReturnValue({ success: true });
      (usernameSchema.safeParse as jest.Mock).mockReturnValue({ success: false });

      const mockPhoneNumber = {
        isValid: jest.fn().mockReturnValue(true),
        getType: jest.fn().mockReturnValue('MOBILE'),
      };
      (parsePhoneNumberFromString as jest.Mock).mockReturnValue(mockPhoneNumber);

      const { result } = renderHook(() => useForgotPasswordStore());

      let detectedType: string | null = null;
      act(() => {
        detectedType = result.current.detectTextType('+1234567890');
      });

      expect(detectedType).toBe('phone');
      expect(result.current.textType).toBe('phone');
      expect(parsePhoneNumberFromString).toHaveBeenCalledWith('+1234567890', 'US');
      expect(mockPhoneNumber.isValid).toHaveBeenCalled();
      expect(mockPhoneNumber.getType).toHaveBeenCalled();
    });

    it('detects username correctly', () => {
      (emailSchema.safeParse as jest.Mock).mockReturnValue({ success: false });
      (phoneSchema.safeParse as jest.Mock).mockReturnValue({ success: false });
      (usernameSchema.safeParse as jest.Mock).mockReturnValue({ success: true });
      (parsePhoneNumberFromString as jest.Mock).mockReturnValue(null);

      const { result } = renderHook(() => useForgotPasswordStore());

      let detectedType: string | null = null;
      act(() => {
        detectedType = result.current.detectTextType('username123');
      });

      expect(detectedType).toBe('username');
      expect(result.current.textType).toBe('username');
      expect(usernameSchema.safeParse).toHaveBeenCalledWith('username123');
    });

    it('returns null for invalid input', () => {
      (emailSchema.safeParse as jest.Mock).mockReturnValue({ success: false });
      (phoneSchema.safeParse as jest.Mock).mockReturnValue({ success: false });
      (usernameSchema.safeParse as jest.Mock).mockReturnValue({ success: false });
      (parsePhoneNumberFromString as jest.Mock).mockReturnValue(null);

      const { result } = renderHook(() => useForgotPasswordStore());

      let detectedType: string | null = null;
      act(() => {
        detectedType = result.current.detectTextType('invalid@@@');
      });

      expect(detectedType).toBe(null);
      expect(result.current.textType).toBe(null);
    });

    it('trims input before validation', () => {
      (emailSchema.safeParse as jest.Mock).mockReturnValue({ success: true });
      (parsePhoneNumberFromString as jest.Mock).mockReturnValue(null);

      const { result } = renderHook(() => useForgotPasswordStore());

      act(() => {
        result.current.detectTextType('  test@example.com  ');
      });

      expect(emailSchema.safeParse).toHaveBeenCalledWith('test@example.com');
    });

    it('validates phone number type as MOBILE', () => {
      (emailSchema.safeParse as jest.Mock).mockReturnValue({ success: false });
      (phoneSchema.safeParse as jest.Mock).mockReturnValue({ success: true });
      (usernameSchema.safeParse as jest.Mock).mockReturnValue({ success: false });

      // Mock phone number that is valid but not MOBILE
      const mockPhoneNumber = {
        isValid: jest.fn().mockReturnValue(true),
        getType: jest.fn().mockReturnValue('FIXED_LINE'),
      };
      (parsePhoneNumberFromString as jest.Mock).mockReturnValue(mockPhoneNumber);

      const { result } = renderHook(() => useForgotPasswordStore());

      let detectedType: string | null = null;
      act(() => {
        detectedType = result.current.detectTextType('+1234567890');
      });

      // Should not detect as phone since it's not MOBILE
      expect(detectedType).toBe(null);
      expect(result.current.textType).toBe(null);
    });

    it('handles invalid phone numbers', () => {
      (emailSchema.safeParse as jest.Mock).mockReturnValue({ success: false });
      (phoneSchema.safeParse as jest.Mock).mockReturnValue({ success: true });
      (usernameSchema.safeParse as jest.Mock).mockReturnValue({ success: false });

      // Mock invalid phone number
      const mockPhoneNumber = {
        isValid: jest.fn().mockReturnValue(false),
        getType: jest.fn().mockReturnValue('MOBILE'),
      };
      (parsePhoneNumberFromString as jest.Mock).mockReturnValue(mockPhoneNumber);

      const { result } = renderHook(() => useForgotPasswordStore());

      let detectedType: string | null = null;
      act(() => {
        detectedType = result.current.detectTextType('+invalid');
      });

      expect(detectedType).toBe(null);
      expect(result.current.textType).toBe(null);
    });
  });

  describe('reset', () => {
    it('resets all state to initial values', () => {
      const { result } = renderHook(() => useForgotPasswordStore());

      // Mock for detectTextType
      (emailSchema.safeParse as jest.Mock).mockReturnValue({ success: true });
      (parsePhoneNumberFromString as jest.Mock).mockReturnValue(null);

      // Set some state first
      act(() => {
        result.current.setIdentifier('test@example.com');
        result.current.setResetToken('token-123');
        result.current.detectTextType('test@example.com');
      });

      // Verify state is set
      expect(result.current.identifier).toBe('test@example.com');
      expect(result.current.resetToken).toBe('token-123');
      expect(result.current.textType).toBe('email');

      // Reset
      act(() => {
        result.current.reset();
      });

      // Verify state is reset
      expect(result.current.identifier).toBe('');
      expect(result.current.textType).toBe(null);
      expect(result.current.resetToken).toBe('');
    });
  });

  describe('state persistence', () => {
    it('maintains state across multiple calls', () => {
      const { result } = renderHook(() => useForgotPasswordStore());

      act(() => {
        result.current.setIdentifier('test@example.com');
        result.current.setResetToken('token-123');
      });

      const { result: result2 } = renderHook(() => useForgotPasswordStore());

      expect(result2.current.identifier).toBe('test@example.com');
      expect(result2.current.resetToken).toBe('token-123');
    });
  });
});
