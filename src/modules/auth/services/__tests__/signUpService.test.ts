import api from '../../../../services/apiClient';
import * as errorExtraction from '../../../../utils/errorExtraction';
import { signUpStep1, signUpStep3 } from '../signUpService';

jest.mock('../../../../services/apiClient');
jest.mock('../../../../utils/errorExtraction');

const mockApi = api as jest.Mocked<typeof api>;

describe('signUpService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(errorExtraction.extractErrorMessage).mockImplementation((error: any) => {
      if (error instanceof Error) return error.message;
      return String(error);
    });
  });

  describe('signUpStep1', () => {
    it('should return true when email is sent successfully', async () => {
      const mockResponse = { data: { data: { isEmailSent: true } } };
      mockApi.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await signUpStep1({
        email: 'test@example.com',
        language: 'en',
      });

      expect(result).toBe(true);
      expect(mockApi.post).toHaveBeenCalledWith('/auth/signup/step1', {
        email: 'test@example.com',
        language: 'en',
      });
    });

    it('should return false when email is not sent', async () => {
      const mockResponse = { data: { data: { isEmailSent: false } } };
      mockApi.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await signUpStep1({
        email: 'test@example.com',
        language: 'en',
      });

      expect(result).toBe(false);
    });

    it('should throw error on API failure', async () => {
      const error = new Error('Email send failed');
      mockApi.post = jest.fn().mockRejectedValue(error);
      jest.mocked(errorExtraction.extractErrorMessage).mockReturnValue('Email send failed');

      await expect(signUpStep1({ email: 'test@example.com', language: 'en' })).rejects.toThrow('Email send failed');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network timeout');
      mockApi.post = jest.fn().mockRejectedValue(networkError);
      jest.mocked(errorExtraction.extractErrorMessage).mockReturnValue('Network timeout');

      await expect(signUpStep1({ email: 'test@example.com', language: 'en' })).rejects.toThrow('Network timeout');
    });

    it('should handle different email formats', async () => {
      const emails = ['simple@example.com', 'user.name@example.co.uk', 'user+tag@example.com'];

      for (const email of emails) {
        const mockResponse = { data: { data: { isEmailSent: true } } };
        mockApi.post = jest.fn().mockResolvedValue(mockResponse);

        const result = await signUpStep1({ email, language: 'en' });
        expect(result).toBe(true);
      }
    });

    it('should handle different languages', async () => {
      const languages = ['en', 'ar', 'es', 'fr', 'de'];

      for (const language of languages) {
        const mockResponse = { data: { data: { isEmailSent: true } } };
        mockApi.post = jest.fn().mockResolvedValue(mockResponse);

        const result = await signUpStep1({
          email: 'test@example.com',
          language,
        });
        expect(result).toBe(true);
      }
    });

    it('should handle 400 error with specific message', async () => {
      const error = {
        response: { status: 400, data: { message: 'Email already exists' } },
      };
      mockApi.post = jest.fn().mockRejectedValue(error);
      jest.mocked(errorExtraction.extractErrorMessage).mockReturnValue('Email already exists');

      await expect(signUpStep1({ email: 'existing@example.com', language: 'en' })).rejects.toThrow(
        'Email already exists',
      );
    });
  });

  describe('signUpStep3', () => {
    it('should return response on successful sign up completion', async () => {
      const mockResponse = {
        data: {
          token: 'auth-token-123',
          user: { id: 1, email: 'test@example.com' },
        },
      };
      mockApi.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await signUpStep3({
        email: 'test@example.com',
        otp: '123456',
        password: 'SecurePassword123!',
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockApi.post).toHaveBeenCalledWith('/auth/signup/step3', {
        email: 'test@example.com',
        otp: '123456',
        password: 'SecurePassword123!',
      });
    });

    it('should throw error on API failure', async () => {
      const error = new Error('Sign up failed');
      mockApi.post = jest.fn().mockRejectedValue(error);
      jest.mocked(errorExtraction.extractErrorMessage).mockReturnValue('Sign up failed');

      await expect(
        signUpStep3({
          email: 'test@example.com',
          otp: '123456',
          password: 'Password123!',
        }),
      ).rejects.toThrow('Sign up failed');
    });

    it('should handle invalid OTP error', async () => {
      const error = {
        response: { status: 400, data: { message: 'Invalid OTP' } },
      };
      mockApi.post = jest.fn().mockRejectedValue(error);
      jest.mocked(errorExtraction.extractErrorMessage).mockReturnValue('Invalid OTP');

      await expect(
        signUpStep3({
          email: 'test@example.com',
          otp: 'wrong',
          password: 'Password123!',
        }),
      ).rejects.toThrow('Invalid OTP');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network timeout');
      mockApi.post = jest.fn().mockRejectedValue(networkError);
      jest.mocked(errorExtraction.extractErrorMessage).mockReturnValue('Network timeout');

      await expect(
        signUpStep3({
          email: 'test@example.com',
          otp: '123456',
          password: 'Password123!',
        }),
      ).rejects.toThrow('Network timeout');
    });

    it('should handle server 500 error', async () => {
      const error = {
        response: { status: 500, data: { message: 'Server error' } },
      };
      mockApi.post = jest.fn().mockRejectedValue(error);
      jest.mocked(errorExtraction.extractErrorMessage).mockReturnValue('Server error');

      await expect(
        signUpStep3({
          email: 'test@example.com',
          otp: '123456',
          password: 'Password123!',
        }),
      ).rejects.toThrow('Server error');
    });

    it('should handle response with different user fields', async () => {
      const mockResponse = {
        data: {
          token: 'token-123',
          user: {
            id: 1,
            email: 'test@example.com',
            username: 'testuser',
            avatarUrl: 'https://example.com/avatar.jpg',
          },
        },
      };
      mockApi.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await signUpStep3({
        email: 'test@example.com',
        otp: '123456',
        password: 'Password123!',
      });

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle special characters in password', async () => {
      const mockResponse = {
        data: {
          token: 'token-123',
          user: { id: 1, email: 'test@example.com' },
        },
      };
      mockApi.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await signUpStep3({
        email: 'test@example.com',
        otp: '123456',
        password: 'P@ssw0rd!#$%&*()',
      });

      expect(result).toEqual(mockResponse.data);
    });
  });
});
