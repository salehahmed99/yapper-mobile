import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import ar from './locales/ar.json';
import en from './locales/en.json';

const STORED_LANGUAGE_KEY = 'appLanguage';

const getDeviceLanguage = () => getLocales()[0].languageCode || 'en';

const loadStoredLanguage = async () => {
  const storedLanguage = await AsyncStorage.getItem(STORED_LANGUAGE_KEY);
  return storedLanguage || getDeviceLanguage();
};

export const changeLanguage = (language: string) => {
  i18n.changeLanguage(language);
  AsyncStorage.setItem(STORED_LANGUAGE_KEY, language);
  const isRTL = language === 'ar';
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
  }
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

loadStoredLanguage().then((language) => {
  changeLanguage(language);
});
export default i18n;
