import { ISettingsItem } from '../types/types';
import { TFunction } from 'i18next';

// Function to get localized settings data - accepts t function from component
export const getSettingsData = (t: TFunction): ISettingsItem[] => [
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

export const getYourAccountData = (t: TFunction): ISettingsItem[] => [
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
