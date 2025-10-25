import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import ar from './locales/ar.json';
import en from './locales/en.json';

const STORED_LANGUAGE_KEY = 'appLanguage';

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
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem(STORED_LANGUAGE_KEY, language);
    const isRTL = language === 'ar';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
    }
  } catch (error) {
    console.error('Error changing language:', error);
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

// Then load stored language asynchronously
loadStoredLanguage()
  .then((language) => {
    const isRTL = language === 'ar';

    // Set RTL on app initialization
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
    }

    // Change to stored language
    i18n.changeLanguage(language);
  })
  .catch((error) => {
    console.error('Error initializing language:', error);
  });

export default i18n;
