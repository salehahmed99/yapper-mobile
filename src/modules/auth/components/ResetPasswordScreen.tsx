import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { typography, spacing, colors } from '@/src/constants/theme';
import DisabledInput from './shared/DisabledInput';
import PasswordInput from './shared/PasswordInput';

interface IResetPasswordPageProps {
  userIdentifier: string;
  newPassword: string;
  confirmPassword: string;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onToggleNewPasswordVisibility?: () => void;
  onToggleConfirmPasswordVisibility?: () => void;
  isNewPasswordVisible?: boolean;
  isConfirmPasswordVisible?: boolean;
}

const ResetPasswordScreen: React.FC<IResetPasswordPageProps> = ({
  userIdentifier,
  newPassword,
  confirmPassword,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onToggleNewPasswordVisibility,
  onToggleConfirmPasswordVisibility,
  isNewPasswordVisible = false,
  isConfirmPasswordVisible = false,
}) => {
  const { t } = useTranslation();
  const styles = createStyles();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.forgotPassword.resetPasswordTitle')}</Text>
      <Text style={styles.description}>{t('auth.forgotPassword.resetPasswordDescription')}</Text>

      <DisabledInput value={userIdentifier} />

      <PasswordInput
        label={t('auth.login.passwordLabel')}
        value={newPassword}
        onChangeText={onNewPasswordChange}
        onToggleVisibility={onToggleNewPasswordVisibility}
        isVisible={isNewPasswordVisible}
        showCheck={newPassword.length >= 1}
      />

      <PasswordInput
        label={t('auth.forgotPassword.confirmPasswordLabel')}
        value={confirmPassword}
        onChangeText={onConfirmPasswordChange}
        onToggleVisibility={onToggleConfirmPasswordVisibility}
        isVisible={isConfirmPasswordVisible}
        showCheck={confirmPassword.length > 0}
        status={confirmPassword.length > 0 && confirmPassword !== newPassword ? 'warning' : 'success'}
        errorMessage={confirmPassword !== newPassword ? 'Passwords do not match' : ''}
      />
    </View>
  );
};

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.dark.background.primary,
      paddingHorizontal: spacing.md - 1,
      paddingTop: spacing.xxl + spacing.lg,
    },
    title: {
      fontSize: typography.sizes.xxl + 1,
      fontFamily: typography.fonts.bold,
      color: colors.dark.text.primary,
      lineHeight: 36,
      letterSpacing: -0.3,
      marginBottom: spacing.sm,
    },
    description: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fonts.regular,
      color: colors.dark.text.secondary,
      lineHeight: 20,
      marginBottom: spacing.xxl,
    },
  });

export default ResetPasswordScreen;
