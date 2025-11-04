import { IUser, mapUserDTOToUser } from '../../types/user';
import { IApiResponse } from '../../types/api';

export interface ILoginCredentials {
  identifier: string;
  type: 'email' | 'username' | 'phone_number';
}
/**
 * Login
 */
export type ILoginResponse = IApiResponse<{ accessToken: string; user: IUser }>;
export type ILoginResponseDTO = IApiResponse<{ access_token: string; user: IUser }>;

export interface ILoginCredentials {
  identifier: string;
  type: 'email' | 'username' | 'phone_number';
  password: string;
}

/**
 * Forget Password
 */
export interface IForgetPasswordRequest {
  identifier: string;
}
export type IForgetPasswordResponse = IApiResponse<{ isEmailSent: boolean }>;

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

/**
 * Verify OTP
 */
export interface IVerifyOTPRequest {
  identifier: string;
  token: string;
}
export type IVerifyOTPResponse = IApiResponse<{ isValid: boolean; resetToken: string }>;

/**
 * Reset Password
 */
export interface IResetPasswordRequest {
  resetToken: string;
  newPassword: string;
  identifier: string;
}
export type IResetPasswordRequestDTO = {
  reset_token: string;
  new_password: string;
  identifier: string;
};
export type IResetPasswordResponse = IApiResponse<null>;

/**
 * Mappers
 */
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

export function mapResetPasswordRequestToDTO(request: IResetPasswordRequest): IResetPasswordRequestDTO {
  return {
    reset_token: request.resetToken,
    new_password: request.newPassword,
    identifier: request.identifier,
  };
}
export interface IRegisterData {
  name: string;
  email: string;
  password: string;
}
