import { IUser, mapUserDTOToUser } from '../../types/user';
import { IApiResponse } from '../../types/api';

/* =========================================================
   AUTH — SHARED TYPES
   ========================================================= */
export interface ILoginCredentials {
  identifier: string;
  type: 'email' | 'username' | 'phone_number';
  password: string;
}

export interface IForgetPasswordRequest {
  identifier: string;
}

export interface IVerifyOTPRequest {
  identifier: string;
  token: string;
}

export interface IResetPasswordRequest {
  resetToken: string;
  newPassword: string;
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
export type ILoginResponseDTO = IApiResponse<{
  access_token: string;
  user: IUser;
}>;

export type ILoginResponse = IApiResponse<{
  accessToken: string;
  user: IUser;
}>;

export function mapLoginResponseDTOToLoginResponse(dto: ILoginResponseDTO): ILoginResponse {
  return {
    data: {
      accessToken: dto.data.access_token,
      user: mapUserDTOToUser(dto.data.user),
    },
    count: dto.count,
    message: dto.message,
  };
}

/* =========================================================
   AUTH — PASSWORD RESET
   ========================================================= */
export type IForgetPasswordResponse = IApiResponse<{
  isEmailSent: boolean;
}>;

export type IVerifyOTPResponse = IApiResponse<{
  isValid: boolean;
  reset_token: string;
}>;

export type IResetPasswordRequestDTO = {
  reset_token: string;
  new_password: string;
  identifier: string;
};

export type IResetPasswordResponse = IApiResponse<null>;

export function mapResetPasswordRequestToDTO(request: IResetPasswordRequest): IResetPasswordRequestDTO {
  return {
    reset_token: request.resetToken,
    new_password: request.newPassword,
    identifier: request.identifier,
  };
}

/* =========================================================
   AUTH — OAUTH
   ========================================================= */
export interface IOAuthResponseDTO {
  data: {
    needs_completion: boolean;
    session_token: string;
    provider: 'google' | 'github';
  };
  count: number;
  message: string;
}

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

export function mapOAuthResponseDTOToOAuthResponse(dto: IOAuthResponseDTO): IOAuthResponse {
  return {
    data: {
      needsCompletion: dto.data.needs_completion,
      sessionToken: dto.data.session_token,
      provider: dto.data.provider,
    },
    count: dto.count,
    message: dto.message,
  };
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

export interface ISignUpStep3ResponseDTO {
  data: {
    access_token: string;
    user: IUser;
  };
  count: number;
  message: string;
}

export interface ISignUpStep3Response {
  data: {
    accessToken: string;
    user: IUser;
  };
  count: number;
  message: string;
}

export function mapSignUpStep3ResponseDTOToSignUpStep3Response(dto: ISignUpStep3ResponseDTO): ISignUpStep3Response {
  return {
    data: {
      accessToken: dto.data.access_token,
      user: mapUserDTOToUser(dto.data.user),
    },
    count: dto.count,
    message: dto.message,
  };
}
