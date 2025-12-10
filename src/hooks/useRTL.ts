import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';

/**
 * Hook to detect RTL (Right-to-Left) layout direction
 * @returns {boolean} true if the current language is RTL (Arabic), false otherwise
 */
export const useRTL = (): boolean => {
  const { i18n } = useTranslation();
  return i18n.language === 'ar' || I18nManager.isRTL;
};
