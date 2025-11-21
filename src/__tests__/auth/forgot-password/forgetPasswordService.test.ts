import * as forgetPasswordService from '../../../modules/auth/services/forgetPasswordService';
import api from '../../../services/apiClient';
import { extractErrorMessage } from '../../../utils/errorExtraction';
import { IForgetPasswordRequest, IVerifyOTPRequest, IResetPasswordRequest } from '../../../modules/auth/types';

// Mock the API client
jest.mock('../../../services/apiClient');
jest.mock('../../../utils/errorExtraction');

const mockApi = api as jest.Mocked<typeof api>;
const mockExtractErrorMessage = extractErrorMessage as jest.MockedFunction<typeof extractErrorMessage>;

describe('ForgetPasswordService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestForgetPassword', () => {
    it('successfully requests password reset', async () => {
      const mockResponse = {
        data: {
          data: {
            isEmailSent: true,
          },
        },
      };
      mockApi.post.mockResolvedValue(mockResponse);

      const credentials: IForgetPasswordRequest = {
        identifier: 'test@example.com',
      };

      const result = await forgetPasswordService.requestForgetPassword(credentials);

      expect(mockApi.post).toHaveBeenCalledWith('/auth/forget-password', credentials);
      expect(result).toBe(true);
    });

    it('returns false when email sending fails', async () => {
      const mockResponse = {
        data: {
          data: {
            isEmailSent: false,
          },
        },
      };
      mockApi.post.mockResolvedValue(mockResponse);

      const credentials: IForgetPasswordRequest = {
        identifier: 'test@example.com',
      };

      const result = await forgetPasswordService.requestForgetPassword(credentials);

      expect(result).toBe(false);
    });

    it('handles API errors correctly', async () => {
      const errorMessage = 'Network error';
      const apiError = new Error('API Error');
      mockApi.post.mockRejectedValue(apiError);
      mockExtractErrorMessage.mockReturnValue(errorMessage);

      const credentials: IForgetPasswordRequest = {
        identifier: 'test@example.com',
      };

      await expect(forgetPasswordService.requestForgetPassword(credentials)).rejects.toThrow(errorMessage);
      expect(mockExtractErrorMessage).toHaveBeenCalledWith(apiError);
    });
  });

  describe('verifyOTP', () => {
    it('handles API errors correctly', async () => {
      const errorMessage = 'Invalid OTP';
      const apiError = new Error('API Error');
      mockApi.post.mockRejectedValue(apiError);
      mockExtractErrorMessage.mockReturnValue(errorMessage);

      const credentials: IVerifyOTPRequest = {
        identifier: 'test@example.com',
        token: '123456',
      };

      await expect(forgetPasswordService.verifyOTP(credentials)).rejects.toThrow(errorMessage);
      expect(mockExtractErrorMessage).toHaveBeenCalledWith(apiError);
    });
  });

  describe('resetPassword', () => {
    it('successfully resets password', async () => {
      const mockResponse = {
        data: {
          message: 'Password reset successfully',
        },
      };
      mockApi.post.mockResolvedValue(mockResponse);

      const credentials: IResetPasswordRequest = {
        resetToken: 'reset-token-123',
        newPassword: 'newpassword123',
        identifier: 'test@example.com',
      };

      const result = await forgetPasswordService.resetPassword(credentials);

      expect(mockApi.post).toHaveBeenCalledWith('/auth/reset-password', credentials);
      expect(result).toBe(true);
    });

    it('returns false when reset fails', async () => {
      const mockResponse = {
        data: {
          message: 'Reset failed',
        },
      };
      mockApi.post.mockResolvedValue(mockResponse);

      const credentials: IResetPasswordRequest = {
        resetToken: 'reset-token-123',
        newPassword: 'newpassword123',
        identifier: 'test@example.com',
      };

      const result = await forgetPasswordService.resetPassword(credentials);

      expect(result).toBe(false);
    });

    it('handles API errors correctly', async () => {
      const errorMessage = 'Network error';
      const apiError = new Error('API Error');
      mockApi.post.mockRejectedValue(apiError);
      mockExtractErrorMessage.mockReturnValue(errorMessage);

      const credentials: IResetPasswordRequest = {
        resetToken: 'reset-token-123',
        newPassword: 'newpassword123',
        identifier: 'test@example.com',
      };

      await expect(forgetPasswordService.resetPassword(credentials)).rejects.toThrow(errorMessage);
      expect(mockExtractErrorMessage).toHaveBeenCalledWith(apiError);
    });
  });
});
