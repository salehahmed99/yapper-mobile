import api from '@/src/services/apiClient';
import { extractErrorMessage } from '@/src/utils/errorExtraction';
import { IChangePasswordRequest, IConfirmPasswordResetRequest } from '../types/types';

export const confirmCurrentPassword = async (credentials: IConfirmPasswordResetRequest): Promise<boolean> => {
  try {
    const res = await api.post('/auth/confirm-password', credentials);
    return res.status === 200;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const changePassword = async (credentials: IChangePasswordRequest): Promise<boolean> => {
  try {
    const res = await api.post('/auth/change-password', credentials);
    return res.status === 200;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
