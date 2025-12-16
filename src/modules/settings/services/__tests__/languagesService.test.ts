import { changeLanguage } from '../languagesService';
import api from '@/src/services/apiClient';
import { extractErrorMessage } from '@/src/utils/errorExtraction';

jest.mock('@/src/services/apiClient');
jest.mock('@/src/utils/errorExtraction');

const mockedApi = api as jest.Mocked<typeof api>;
const mockedExtractErrorMessage = extractErrorMessage as jest.MockedFunction<typeof extractErrorMessage>;

describe('languagesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedExtractErrorMessage.mockImplementation((error: any) => {
      if (error instanceof Error) {
        return error.message;
      }
      return 'Unknown error';
    });
  });

  describe('changeLanguage', () => {
    it('should successfully change language to English', async () => {
      mockedApi.patch = jest.fn().mockResolvedValue({ data: {} });

      await changeLanguage('en');

      expect(mockedApi.patch).toHaveBeenCalledWith('/users/me/change-language', {
        language: 'en',
      });
    });

    it('should successfully change language to Arabic', async () => {
      mockedApi.patch = jest.fn().mockResolvedValue({ data: {} });

      await changeLanguage('ar');

      expect(mockedApi.patch).toHaveBeenCalledWith('/users/me/change-language', {
        language: 'ar',
      });
    });

    it('should successfully change language to Spanish', async () => {
      mockedApi.patch = jest.fn().mockResolvedValue({ data: {} });

      await changeLanguage('es');

      expect(mockedApi.patch).toHaveBeenCalledWith('/users/me/change-language', {
        language: 'es',
      });
    });

    it('should throw error on API failure', async () => {
      const error = new Error('API Error');
      mockedApi.patch = jest.fn().mockRejectedValue(error);
      mockedExtractErrorMessage.mockReturnValue('Failed to change language');

      await expect(changeLanguage('en')).rejects.toThrow('Failed to change language');
    });

    it('should throw error on network failure', async () => {
      const networkError = new Error('Network error');
      mockedApi.patch = jest.fn().mockRejectedValue(networkError);
      mockedExtractErrorMessage.mockReturnValue('Network connection failed');

      await expect(changeLanguage('en')).rejects.toThrow('Network connection failed');
    });

    it('should handle various language codes', async () => {
      const languageCodes = ['en', 'ar', 'es', 'fr', 'de', 'zh', 'ja', 'pt'];

      mockedApi.patch = jest.fn().mockResolvedValue({ data: {} });

      for (const code of languageCodes) {
        await changeLanguage(code);
        expect(mockedApi.patch).toHaveBeenCalledWith('/users/me/change-language', {
          language: code,
        });
      }
    });

    it('should handle empty language code', async () => {
      mockedApi.patch = jest.fn().mockResolvedValue({ data: {} });

      await changeLanguage('');

      expect(mockedApi.patch).toHaveBeenCalledWith('/users/me/change-language', {
        language: '',
      });
    });

    it('should handle invalid language code gracefully', async () => {
      const error = new Error('Invalid language code');
      mockedApi.patch = jest.fn().mockRejectedValue(error);
      mockedExtractErrorMessage.mockReturnValue('Invalid language code');

      await expect(changeLanguage('invalid')).rejects.toThrow('Invalid language code');
    });

    it('should resolve without returning value', async () => {
      mockedApi.patch = jest.fn().mockResolvedValue({ data: {} });

      const result = await changeLanguage('en');

      expect(result).toBeUndefined();
    });
  });
});
