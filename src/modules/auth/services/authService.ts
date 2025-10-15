import Toast from 'react-native-toast-message';
import api from '../../../api/api';
import {
  LoginResponse,
  LoginCredentials,
} from '../types';

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    console.log('API URL:', process.env.API_URL);
    const { data } = await api.post<LoginResponse>('/auth/login', credentials);
    console.log(data);
    return data;
  } catch (error: any) {
    console.error(error);
    Toast.show({
      type: 'error',
      text1: 'Login Failed',
      text2: error.response?.message || 'An unexpected error occurred. Please try again.',
    });
    throw error;
  }
};
