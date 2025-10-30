import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import type { Theme } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';
import DisabledInput from './shared/DisabledInput';
import PasswordInput from './shared/PasswordInput';

interface IPasswordFormProps {
  userIdentifier: string;
  password: string;
  onPasswordChange: (password: string) => void;
  onTogglePasswordVisibility?: () => void;
  isPasswordVisible?: boolean;
}

const PasswordForm: React.FC<IPasswordFormProps> = ({
  userIdentifier,
  password,
  onPasswordChange,
  onTogglePasswordVisibility,
  isPasswordVisible = false,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.login.passwordTitle')}</Text>

      {/* Disabled User Identifier Input */}
      <DisabledInput value={userIdentifier} />

      {/* Password Input with Floating Label */}
      <PasswordInput
        label={t('auth.login.passwordLabel')}
        value={password}
        onChangeText={onPasswordChange}
        onToggleVisibility={onTogglePasswordVisibility}
        isVisible={isPasswordVisible}
        showCheck={true}
        status="success"
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
      paddingTop: theme.spacing.xxl,
    },
    title: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.xml,
      fontFamily: theme.typography.fonts.bold,
      lineHeight: 36,
      marginBottom: theme.spacing.lg,
      letterSpacing: -0.3,
    },
  });

export default PasswordForm;
