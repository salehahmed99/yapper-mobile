import api from '../../../services/apiClient';
import { extractErrorMessage } from '../../../utils/errorExtraction';

interface ISignUpStep1Request {
  email: string;
  birth_date: string;
  name: string;
  captcha_token: string;
}

interface ISignUpStep1Response {
  data: {
    isEmailSent: boolean;
  };
  message: string;
}

interface IVerifySignUpOTPRequest {
  email: string;
  token: string;
}

interface IVerifySignUpOTPResponse {
  data: {
    isVerified: boolean;
    recommendations: string[];
  };
  count: number;
  message: string;
}

interface IReSendVerificationCodeRequest {
  email: string;
}

interface IReSendVerificationCodeResponse {
  data: {
    isEmailSent: boolean;
  };
  message: string;
}

/**
 * Send Verification Code for Sign Up
 */
export const signUpStep1 = async (credentials: ISignUpStep1Request): Promise<boolean> => {
  try {
    const res = await api.post<ISignUpStep1Response>('/auth/signup/step1', credentials);
    return res.data.data.isEmailSent;
  } catch (error: unknown) {
    const message = extractErrorMessage(error);
    throw new Error(message);
  }
};

/**
 * Verify OTP for Sign Up
 */
export const verifySignUpOTP = async (credentials: IVerifySignUpOTPRequest): Promise<IVerifySignUpOTPResponse> => {
  try {
    const res = await api.post<IVerifySignUpOTPResponse>('/auth/signup/step2', credentials);
    return res.data.data.isVerified
      ? res.data
      : { data: { isVerified: false, recommendations: [] }, count: 0, message: '' };
  } catch (error: unknown) {
    const message = extractErrorMessage(error);
    throw new Error(message);
  }
};

/**
 * Resend Verification Code
 */
export const resendVerificationCode = async (credentials: IReSendVerificationCodeRequest): Promise<boolean> => {
  try {
    const res = await api.post<IReSendVerificationCodeResponse>('/auth/resend-verification-code', credentials);
    return res.data.data.isEmailSent;
  } catch (error: unknown) {
    const message = extractErrorMessage(error);
    throw new Error(message);
  }
};
