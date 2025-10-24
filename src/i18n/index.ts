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
  const storedLanguage = await AsyncStorage.getItem(STORED_LANGUAGE_KEY);
  return storedLanguage || getDeviceLanguage();
};

export const changeLanguage = async (language: string) => {
  try {
    i18n.changeLanguage(language);
    await AsyncStorage.setItem(STORED_LANGUAGE_KEY, language);
    const isRTL = language === 'ar';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
    }
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

loadStoredLanguage().then((language) => {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: language,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
}).catch((error) => {
  console.error('Error initializing i18n:', error);
});
export default i18n;
