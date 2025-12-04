import { ISettingsItem } from '../types/types';

export const SETTINGS_DATA: ISettingsItem[] = [
  {
    id: 'your-account',
    title: 'Your account',
    icon: 'account-outline',
    iconFamily: 'MaterialCommunityIcons',
    description:
      'See information about your account, download an archive of your data, or learn about your account deactivation options.',
    route: 'yourAccount',
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
    route: 'MuteAndBlock/MuteAndBlockScreen',
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

export const YOUR_ACCOUNT_DATA: ISettingsItem[] = [
  {
    id: 'account-information',
    title: 'Account information',
    icon: 'person-outline',
    iconFamily: 'Ionicons',
    description: 'See your account information like your phone number and email address.',
    route: 'AccountInformation',
  },
  {
    id: 'change-password',
    title: 'Change your password',
    icon: 'lock-outline',
    iconFamily: 'MaterialCommunityIcons',
    description: 'Change your password at any time.',
    route: 'changePassword',
  },
  {
    id: 'deactivate-account',
    title: 'Deactivate Account',
    icon: 'heart-dislike-outline',
    iconFamily: 'Ionicons',
    description: 'Find out how you can deactivate your account.',
    route: 'deactivateAccount',
  },
];
