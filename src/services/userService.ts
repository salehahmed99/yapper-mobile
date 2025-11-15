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

/**
 * Upload Profile Picture
 */
export const uploadProfilePicture = async (file: { uri: string; name: string; type: string }): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob);

    const res = await api.post('/users/me/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.status === 200 || res.status === 201;
  } catch (error: unknown) {
    const message = extractErrorMessage(error);
    throw new Error(message);
  }
};
