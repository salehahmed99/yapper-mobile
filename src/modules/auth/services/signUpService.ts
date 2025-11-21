import api from '../../../services/apiClient';
import { extractErrorMessage } from '../../../utils/errorExtraction';
import {
  ISignUpStep1Request,
  ISignUpStep1Response,
  IReSendVerificationCodeRequest,
  IReSendVerificationCodeResponse,
  IVerifySignUpOTPRequest,
  IVerifySignUpOTPResponse,
  ISignUpStep3Response,
  ISignUpStep3Request,
} from '../types';

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
 * Sign Up Step 3 - Set Password and Complete Registration
 */
export const signUpStep3 = async (credentials: ISignUpStep3Request): Promise<ISignUpStep3Response> => {
  try {
    const res = await api.post('/auth/signup/step3', credentials);
    return res.data;
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
    const res = await api.post<IReSendVerificationCodeResponse>('/auth/resend-otp', credentials);
    return res.data.data.isEmailSent;
  } catch (error: unknown) {
    const message = extractErrorMessage(error);
    throw new Error(message);
  }
};
