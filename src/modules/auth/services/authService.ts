import api from '../../../services/apiClient';
import { ILoginCredentials, ILoginResponse, mapLoginResponseDTOToLoginResponse } from '../types';

export const login = async (credentials: ILoginCredentials): Promise<ILoginResponse> => {
  try {
    const response = await api.post('/auth/login', { ...credentials });
    return mapLoginResponseDTOToLoginResponse(response.data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred during login.');
    }
    throw error;
  }
};

export const checkExists = async (identifier: string): Promise<boolean> => {
  try {
    const res = await api.post('/auth/check-identifier', { identifier });
    return res.data.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.message || 'This user does not exist.');
    }
    throw error;
  }
};
