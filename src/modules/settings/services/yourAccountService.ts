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
    return res.status === 200 || res.status === 201;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const deleteAccount = async (): Promise<boolean> => {
  try {
    const res = await api.delete('/users/me/delete-account');
    return res.status === 200 || res.status === 201;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const changeUsername = async (newUsername: string): Promise<boolean> => {
  try {
    const res = await api.patch('/users/me', { username: newUsername });
    if (res.status === 200 || res.status === 201) {
      useAuthStore.getState().setUserName(newUsername);
      return true;
    }
    return false;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const changeEmail = async (newEmail: string): Promise<boolean> => {
  try {
    const res = await api.post('/auth/update-email', { newEmail: newEmail });
    return res.status === 200 || res.status === 201;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const verifyChangeEmail = async (token: string, newEmail: string): Promise<boolean> => {
  try {
    const res = await api.post('/auth/update-email/verify', { otp: token });
    if (res.status === 200 || res.status === 201) {
      useAuthStore.getState().setEmail(newEmail);
      return true;
    }
    return false;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const changeCountry = async (newCountry: string): Promise<boolean> => {
  try {
    const res = await api.patch('/users/me', { country: newCountry });
    if (res.status === 200 || res.status === 201) {
      useAuthStore.getState().setCountry(newCountry);
      return true;
    }
    return false;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
