import React, { useMemo } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/context/ThemeContext';
import { Theme } from '@/src/constants/theme';
import DisabledInput from '../shared/DisabledInput';
import PasswordInput from '../shared/PasswordInput';

interface IResetPasswordProps {
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

const ResetPassword: React.FC<IResetPasswordProps> = ({
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
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
        status="success"
      />

      <PasswordInput
        label={t('auth.forgotPassword.confirmPasswordLabel')}
        value={confirmPassword}
        onChangeText={onConfirmPasswordChange}
        onToggleVisibility={onToggleConfirmPasswordVisibility}
        isVisible={isConfirmPasswordVisible}
        showCheck={confirmPassword.length > 0}
        status={confirmPassword.length > 0 && confirmPassword !== newPassword ? 'error' : 'success'}
        errorMessage={confirmPassword !== newPassword ? t('auth.forgotPassword.passwordMismatchDescription') : ''}
      />
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
      paddingHorizontal: theme.spacing.mdg,
      paddingTop: theme.spacing.xxl + theme.spacing.lg,
    },
    title: {
      fontSize: theme.typography.sizes.xxl + 1,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
      lineHeight: 36,
      letterSpacing: -0.3,
      marginBottom: theme.spacing.sm,
    },
    description: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.secondary,
      lineHeight: 20,
      marginBottom: theme.spacing.xxl,
    },
  });

export default ResetPassword;
