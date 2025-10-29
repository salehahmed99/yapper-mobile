import api from '../../../services/apiClient';
import {
  IForgetPasswordRequest,
  IVerifyOTPRequest,
  IResetPasswordRequest,
  IForgetPasswordResponse,
  IVerifyOTPResponse,
  IResetPasswordResponse,
} from '../types';

/**
 * Request Forget Password
 */
export const requestForgetPassword = async (credentials: IForgetPasswordRequest): Promise<boolean> => {
  try {
    const res = await api.post<IForgetPasswordResponse>('/auth/forget-password', credentials);
    return res.data.data.isEmailSent;
  } catch (error: unknown) {
    let message = 'Something went wrong';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    throw new Error(message);
  }
};

/**
 * Verify OTP
 */
export const verifyOTP = async (credentials: IVerifyOTPRequest): Promise<string> => {
  try {
    const res = await api.post<IVerifyOTPResponse>('/auth/password/verify-otp', credentials);
    return res.data.data.resetToken;
  } catch (error: unknown) {
    let message = 'Something went wrong';

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    throw new Error(message);
  }
};

/**
 * Reset Password
 */
export const resetPassword = async (credentials: IResetPasswordRequest): Promise<boolean> => {
  try {
    const res = await api.post<IResetPasswordResponse>('/auth/reset-password', {
      reset_token: credentials.resetToken,
      new_password: credentials.newPassword,
      identifier: credentials.identifier,
    });
    return res.data.message === 'Password reset successfully';
  } catch (error: unknown) {
    let message = 'Something went wrong';

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    throw new Error(message);
  }
};
