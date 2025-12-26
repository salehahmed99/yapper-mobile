import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import * as Updates from 'expo-updates';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import ar from './locales/ar.json';
import en from './locales/en.json';

const STORED_LANGUAGE_KEY = 'app-language';
const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export const toLocalizedNumber = (value: string): string => {
  const currentLang = i18n.language;

  // 2. If Arabic, apply the digit mapping on top of the formatted string
  if (currentLang.startsWith('ar')) {
    return value.replace(/\d/g, (d) => arabicDigits[parseInt(d)]);
  }

  return value;
};
const getDeviceLanguage = () => getLocales()?.at(0)?.languageCode || 'en';

const loadStoredLanguage = async () => {
  try {
    const storedLanguage = await AsyncStorage.getItem(STORED_LANGUAGE_KEY);
    return storedLanguage || getDeviceLanguage();
  } catch (error) {
    console.error('Error loading stored language:', error);
    return getDeviceLanguage();
  }
};

export const changeLanguage = async (language: string) => {
  try {
    const isRTL = language === 'ar';
    const currentRTL = I18nManager.isRTL;

    // 1. ALWAYS Save the new language and update i18n FIRST
    await AsyncStorage.setItem(STORED_LANGUAGE_KEY, language);
    await i18n.changeLanguage(language);

    // 2. Handle RTL toggle
    if (currentRTL !== isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(isRTL);

      // 3. Reload LAST
      await Updates.reloadAsync();
    }
  } catch (error) {
    console.error('Error changing language:', error);
    throw error;
  }
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: 'en', // Start with default
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export const initLanguage = async () => {
  const language = await loadStoredLanguage();
  const isRTL = language === 'ar';

  I18nManager.allowRTL(true);
  I18nManager.forceRTL(isRTL);

  await i18n.changeLanguage(language);
  return language;
};

export default i18n;
