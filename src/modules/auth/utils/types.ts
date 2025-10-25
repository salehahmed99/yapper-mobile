import { IUser } from '../../../types/user';

export interface ILoginResponse {
  data: {
    access_token: string;
    user: IUser;
  };
  count: number;
  message: string;
}

export interface ILoginCredentials {
  identifier: string;
  type: 'email' | 'username' | 'phone_number';
  password: string;
}

export interface IRegisterData {
  name: string;
  email: string;
  password: string;
}
