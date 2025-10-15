import { IUser } from '../../types/user';

export interface LoginResponse {
  data: {
    access_token: string;
    user: IUser;
  };
  count: number;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}
