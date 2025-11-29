export interface ISettingsItem {
  id: string;
  title: string;
  icon: string;
  iconFamily?: 'MaterialCommunityIcons' | 'Ionicons';
  description: string;
  route?: string;
}

export interface ISettingsSection {
  id: string;
  items: ISettingsItem[];
}

export interface IChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface IConfirmPasswordResetRequest {
  password: string;
}
