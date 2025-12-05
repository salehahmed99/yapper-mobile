import { ISettingsItem } from '../types/types';
import i18n from '@/src/i18n';

const t = (key: string) => i18n.t(key);

// Function to get localized settings data - call this dynamically in components
export const getSettingsData = (): ISettingsItem[] => [
  {
    id: 'your-account',
    title: t('settings.your_account.title'),
    icon: 'account-outline',
    iconFamily: 'MaterialCommunityIcons',
    description: t('settings.your_account.description'),
    route: 'yourAccount',
    prefix: '',
  },
  {
    id: 'privacy-safety',
    title: t('settings.privacy_safety.title'),
    icon: 'shield-checkmark-outline',
    iconFamily: 'Ionicons',
    description: t('settings.privacy_safety.description'),
    route: 'MuteAndBlock/MuteAndBlockScreen',
    prefix: '',
  },
  {
    id: 'accessibility',
    title: t('settings.accessibility.title'),
    icon: 'planet-outline',
    iconFamily: 'Ionicons',
    description: t('settings.accessibility.description'),
    route: 'accessibility-display-languages',
    prefix: '',
  },
];

export const getYourAccountData = (): ISettingsItem[] => [
  {
    id: 'account-information',
    title: t('settings.account_info.title'),
    icon: 'person-outline',
    iconFamily: 'Ionicons',
    description: t('settings.account_info.description'),
    route: 'AccountInformation',
    prefix: 'your-account/',
  },
  {
    id: 'change-password',
    title: t('settings.password.title'),
    icon: 'lock-outline',
    iconFamily: 'MaterialCommunityIcons',
    description: t('settings.password.description'),
    route: 'changePassword',
    prefix: 'your-account/',
  },
  {
    id: 'deactivate-account',
    title: t('settings.deactivate.title'),
    icon: 'heart-dislike-outline',
    iconFamily: 'Ionicons',
    description: t('settings.deactivate.description'),
    route: 'deactivateAccount',
    prefix: 'your-account/',
  },
];

// Keep old exports for backward compatibility
export const SETTINGS_DATA = getSettingsData();
export const YOUR_ACCOUNT_DATA = getYourAccountData();
