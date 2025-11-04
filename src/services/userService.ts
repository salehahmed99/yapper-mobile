import api from './apiClient';
import { extractErrorMessage } from '@/src/utils/errorExtraction';
import { ILoginResponse } from '../modules/auth/types';

export const updateUserName = async (newUsername: string): Promise<ILoginResponse> => {
  try {
    const res = await api.post('/auth/update-username', { username: newUsername });
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
