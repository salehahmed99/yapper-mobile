import api from '@/src/services/apiClient';
import { extractErrorMessage } from '@/src/utils/errorExtraction';
import { IChangePasswordRequest, IConfirmPasswordResetRequest } from '../types/types';
import { useAuthStore } from '@/src/store/useAuthStore';

export const confirmCurrentPassword = async (credentials: IConfirmPasswordResetRequest): Promise<boolean> => {
  try {
    const res = await api.post('/auth/confirm-password', credentials);
    return res.data.data.valid === true;
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

export const deleteAccount = async (): Promise<boolean> => {
  try {
    const res = await api.delete('/users/me/delete-account');
    return res.status === 200;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const changeUsername = async (newUsername: string): Promise<boolean> => {
  try {
    const res = await api.patch('/users/me', { username: newUsername });
    useAuthStore.getState().setUserName(newUsername);
    return res.status === 200;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const changeEmail = async (newEmail: string): Promise<boolean> => {
  try {
    const res = await api.patch('/users/me', { email: newEmail });
    useAuthStore.getState().setEmail(newEmail);
    return res.status === 200;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const changeCountry = async (newCountry: string): Promise<boolean> => {
  try {
    const res = await api.patch('/users/me', { country: newCountry });
    useAuthStore.getState().setCountry(newCountry);
    return res.status === 200;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
