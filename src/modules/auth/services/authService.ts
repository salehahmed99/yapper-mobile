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
    throw error;
  }
};

