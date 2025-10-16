import Toast from 'react-native-toast-message';
import api from '../../../api/api';
import {
  LoginResponse,
  LoginCredentials,
} from '../types';

export const login = async (login:LoginCredentials): Promise<LoginResponse | undefined> => {
  try {
    const response = await api.post('/auth/login', { ...login });
    return response.data;
  } catch (error: any) {
    Toast.show({
      type: 'error',
      text1: 'Login Failed',
      text2: error.response?.data?.message || 'An unexpected error occurred. Please try again.',
    });
    throw error;
  }
};

