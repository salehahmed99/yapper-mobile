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

export { mapLoginResponseDTOToLoginResponse, ILoginResponse, ILoginCredentials, IRegisterData };
