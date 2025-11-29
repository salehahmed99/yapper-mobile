import { ISettingsItem } from './types';

export const SETTINGS_DATA: ISettingsItem[] = [
  {
    id: 'your-account',
    title: 'Your account',
    icon: 'account-outline',
    iconFamily: 'MaterialCommunityIcons',
    description:
      'See information about your account, download an archive of your data, or learn about your account deactivation options.',
    route: 'AccountSettings',
  },
  {
    id: 'security-access',
    title: 'Security and account access',
    icon: 'lock-outline',
    iconFamily: 'MaterialCommunityIcons',
    description:
      "Manage your account's security and keep track of your account's usage including apps that you have connected to your account.",
    route: 'SecuritySettings',
  },
  {
    id: 'privacy-safety',
    title: 'Privacy and safety',
    icon: 'shield-checkmark-outline',
    iconFamily: 'Ionicons',
    description: 'Manage what information you see and share on X.',
    route: 'PrivacySettings',
  },
  {
    id: 'accessibility',
    title: 'Accessibility, display and languages',
    icon: 'planet-outline',
    iconFamily: 'Ionicons',
    description: 'Manage how X content is displayed to you.',
    route: 'AccessibilitySettings',
  },
];
