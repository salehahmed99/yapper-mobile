import api from '../../../services/apiClient';
import { extractErrorMessage } from '../../../utils/errorExtraction';
import {
  ICategoryResponse,
  IReSendVerificationCodeRequest,
  IReSendVerificationCodeResponse,
  ISignUpStep1Request,
  ISignUpStep1Response,
  ISignUpStep3Request,
  ISignUpStep3Response,
  IVerifySignUpOTPRequest,
  IVerifySignUpOTPResponse,
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

/**
 * Get all available categories for interests selection
 */
export const getCategories = async (): Promise<string[]> => {
  try {
    const res = await api.get<ICategoryResponse>('/category');
    return res.data.data;
  } catch (error: unknown) {
    const message = extractErrorMessage(error);
    throw new Error(message);
  }
};

/**
 * Submit user's selected interests
 */
export const submitInterests = async (categoryIds: number[]): Promise<void> => {
  try {
    await api.post('/users/me/interests', { category_ids: categoryIds });
  } catch (error: unknown) {
    const message = extractErrorMessage(error);
    throw new Error(message);
  }
};

/**
 * Change user's language
 */
export const changeUserLanguage = async (languageCode: string): Promise<void> => {
  try {
    await api.patch('/users/me/change-language', { language: languageCode });
  } catch (error: unknown) {
    const message = extractErrorMessage(error);
    throw new Error(message);
  }
};
