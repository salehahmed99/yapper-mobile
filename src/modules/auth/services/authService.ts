import api from '../../../services/apiClient';
import { ILoginCredentials, ILoginResponse } from '../types';

export const login = async (login: ILoginCredentials): Promise<ILoginResponse | undefined> => {
  try {
    const response = await api.post('/auth/login', { ...login });
    return response.data;
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};
