import { IUser } from '../../types/user';

interface ILoginResponseDTO {
  data: {
    access_token: string;
    user: IUser;
  };
  count: number;
  message: string;
}

interface ILoginResponse {
  data: {
    accessToken: string;
    user: IUser;
  };
  count: number;
  message: string;
}

interface IOAuthResponseDTO {
  data: {
    needs_completion: boolean;
    session_token: string;
    provider: 'google' | 'github';
  };
  count: number;
  message: string;
}

interface IOAuthResponse {
  data: {
    needsCompletion: boolean;
    sessionToken: string;
    provider: 'google' | 'github';
  };
  count: number;
  message: string;
}

interface IOAuthBirthDateRequest {
  oauth_session_token: string;
  birth_date?: string;
}

interface IOAuthBirthDateResponse {
  data: {
    usernames: string[];
    token: string;
    nextStep: string;
  };
  count: number;
  message: string;
}

interface IOAuthUserNameRequest {
  oauth_session_token: string;
  username: string;
}
function mapOAuthResponseDTOToOAuthResponse(dto: IOAuthResponseDTO): IOAuthResponse {
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

function mapLoginResponseDTOToLoginResponse(dto: ILoginResponseDTO): ILoginResponse {
  return {
    data: {
      accessToken: dto.data.access_token,
      user: dto.data.user,
    },
    count: dto.count,
    message: dto.message,
  };
}

interface ILoginCredentials {
  identifier: string;
  type: 'email' | 'username' | 'phone_number';
  password: string;
}

interface IRegisterData {
  name: string;
  email: string;
  password: string;
}

export {
  mapLoginResponseDTOToLoginResponse,
  ILoginResponse,
  ILoginCredentials,
  IRegisterData,
  mapOAuthResponseDTOToOAuthResponse,
  IOAuthResponse,
  IOAuthBirthDateRequest,
  IOAuthBirthDateResponse,
  IOAuthUserNameRequest,
};
