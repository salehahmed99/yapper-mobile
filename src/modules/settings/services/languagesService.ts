import api from '@/src/services/apiClient';
import { extractErrorMessage } from '@/src/utils/errorExtraction';

export const changeLanguage = async (languageCode: string): Promise<void> => {
  try {
    await api.patch('/users/me/change-language', { language: languageCode });
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
