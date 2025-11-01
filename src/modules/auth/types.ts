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
function mapLoginResponseDTOToLoginResponse(dto: ILoginResponseDTO): ILoginResponse {
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
interface IRegisterData {
  name: string;
  email: string;
  password: string;
}

export { IRegisterData, mapLoginResponseDTOToLoginResponse };
