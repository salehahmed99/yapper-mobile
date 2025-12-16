import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import i18n from 'i18next'; // This will be the mocked version
import { I18nManager } from 'react-native';
import { changeLanguage, initLanguage, toLocalizedNumber } from '../index';

// Mocks
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('expo-updates', () => ({
  reloadAsync: jest.fn(),
}));

jest.mock('react-native', () => ({
  I18nManager: {
    isRTL: false,
    allowRTL: jest.fn(),
    forceRTL: jest.fn(),
  },
}));

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en' }]),
}));

// We need to mock i18next effectively because the file imports it and calls use().init() at top level
jest.mock('i18next', () => {
  return {
    use: jest.fn().mockReturnThis(),
    init: jest.fn(),
    changeLanguage: jest.fn(),
    language: 'en',
  };
});

jest.mock('react-i18next', () => ({
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

describe('i18n service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset I18nManager mock state
    (I18nManager as any).isRTL = false;
    // Reset i18next language
    (i18n as any).language = 'en';
  });

  describe('toLocalizedNumber', () => {
    it('should return number as is for English', () => {
      (i18n as any).language = 'en';
      expect(toLocalizedNumber('123')).toBe('123');
    });

    it('should convert digits for Arabic', () => {
      (i18n as any).language = 'ar';
      // 0->٠, 1->١, 2->٢, 3->٣
      expect(toLocalizedNumber('123')).toBe('١٢٣');
      expect(toLocalizedNumber('059')).toBe('٠٥٩');
    });

    it('should handle mixed content in Arabic', () => {
      (i18n as any).language = 'ar';
      expect(toLocalizedNumber('User 123')).toBe('User ١٢٣');
    });
  });

  describe('initLanguage', () => {
    it('should load stored language if available', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('ar');

      const lang = await initLanguage();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('app-language');
      expect(lang).toBe('ar');
      expect(i18n.changeLanguage).toHaveBeenCalledWith('ar');
      expect(I18nManager.forceRTL).toHaveBeenCalledWith(true);
    });

    it('should fallback to device language if no stored language', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      // Mock getLocales to return 'fr' maybe? Or rely on default mock 'en'
      // The mock above returns 'en'.

      const lang = await initLanguage();
      expect(lang).toBe('en');
      expect(i18n.changeLanguage).toHaveBeenCalledWith('en');
      expect(I18nManager.forceRTL).toHaveBeenCalledWith(false);
    });
  });

  describe('changeLanguage', () => {
    it('should change to RTL language (ar) and reload if currently LTR', async () => {
      (I18nManager as any).isRTL = false;

      await changeLanguage('ar');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('app-language', 'ar');
      expect(i18n.changeLanguage).toHaveBeenCalledWith('ar');
      expect(I18nManager.allowRTL).toHaveBeenCalledWith(true);
      expect(I18nManager.forceRTL).toHaveBeenCalledWith(true);
      expect(Updates.reloadAsync).toHaveBeenCalled();
    });

    it('should change to LTR language (en) and reload if currently RTL', async () => {
      (I18nManager as any).isRTL = true;

      await changeLanguage('en');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('app-language', 'en');
      expect(i18n.changeLanguage).toHaveBeenCalledWith('en');
      expect(I18nManager.allowRTL).toHaveBeenCalledWith(true);
      expect(I18nManager.forceRTL).toHaveBeenCalledWith(false);
      expect(Updates.reloadAsync).toHaveBeenCalled();
    });

    it('should NOT reload if direction does not change', async () => {
      (I18nManager as any).isRTL = false;

      await changeLanguage('en'); // LTR to LTR

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('app-language', 'en');
      expect(i18n.changeLanguage).toHaveBeenCalledWith('en');
      // Should not call layout changes
      expect(I18nManager.allowRTL).not.toHaveBeenCalled();
      expect(I18nManager.forceRTL).not.toHaveBeenCalled();
      expect(Updates.reloadAsync).not.toHaveBeenCalled();
    });

    it('should log error if something fails', async () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(changeLanguage('en')).rejects.toThrow('Storage error');
      expect(spy).toHaveBeenCalled();
    });
  });
});
