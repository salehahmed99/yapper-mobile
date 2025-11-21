import { IApiResponse } from '../../types/api';
import { IUser } from '../../types/user';

/* =========================================================
   AUTH — SHARED TYPES
   ========================================================= */
export interface ILoginCredentials {
  identifier: string;
  type: 'email' | 'username' | 'phone_number';
  password: string;
}
/**
 * Login
 */

export interface IForgetPasswordRequest {
  identifier: string;
}

export interface IVerifyOTPRequest {
  identifier: string;
  token: string;
}

export interface IResetPasswordRequest {
  reset_token: string;
  new_password: string;
  identifier: string;
}

export interface IRegisterData {
  name: string;
  email: string;
  password: string;
}

/* =========================================================
   AUTH — LOGIN
   ========================================================= */

export type ILoginResponse = IApiResponse<{
  accessToken: string;
  user: IUser;
}>;

/* =========================================================
   AUTH — PASSWORD RESET
   ========================================================= */
export type IForgetPasswordResponse = IApiResponse<{
  isEmailSent: boolean;
}>;

export type IVerifyOTPResponse = IApiResponse<{
  isValid: boolean;
  resetToken: string;
}>;

export type IResetPasswordResponse = IApiResponse<null>;

/* =========================================================
   AUTH — OAUTH
   ========================================================= */

export interface IOAuthResponse {
  data: {
    needsCompletion: boolean;
    sessionToken: string;
    provider: 'google' | 'github';
  };
  count: number;
  message: string;
}

export interface IOAuthBirthDateRequest {
  oauth_session_token: string;
  birth_date?: string;
}

export interface IOAuthBirthDateResponse {
  data: {
    usernames: string[];
    token: string;
    nextStep: string;
  };
  count: number;
  message: string;
}

export interface IOAuthUserNameRequest {
  oauth_session_token: string;
  username: string;
}

/* =========================================================
   AUTH — SIGNUP
   ========================================================= */
export interface ISignUpStep1Request {
  email: string;
  birth_date: string;
  name: string;
  captcha_token: string;
}

export interface ISignUpStep1Response {
  data: {
    isEmailSent: boolean;
  };
  message: string;
}

export interface IVerifySignUpOTPRequest {
  email: string;
  token: string;
}

export interface IVerifySignUpOTPResponse {
  data: {
    isVerified: boolean;
    recommendations: string[];
  };
  count: number;
  message: string;
}

export interface IReSendVerificationCodeRequest {
  email: string;
}

export interface IReSendVerificationCodeResponse {
  data: {
    isEmailSent: boolean;
  };
  message: string;
}

export interface ISignUpStep3Request {
  email: string;
  password: string;
  username: string;
  language: string;
}

export interface ISignUpStep3Response {
  data: {
    accessToken: string;
    user: IUser;
  };
  count: number;
  message: string;
}
