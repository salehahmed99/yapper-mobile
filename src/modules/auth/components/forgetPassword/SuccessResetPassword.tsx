import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

interface SuccessResetPasswordProps {
  onContinue?: () => void;
}

const SuccessResetPassword: React.FC<SuccessResetPasswordProps> = ({ onContinue }) => {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const { replace } = useNavigation();

  // Separate scale factors for width, height, and font
  const scaleWidth = Math.min(Math.max(width / 390, 0.85), 1.1);
  const scaleHeight = Math.min(Math.max(height / 844, 0.85), 1.1);
  const fontScale = Math.min(scaleWidth, scaleHeight);

  const styles = useMemo(
    () => createStyles(theme, scaleWidth, scaleHeight, fontScale),
    [theme, scaleWidth, scaleHeight, fontScale],
  );
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>{t('auth.forgotPassword.successTitle')}</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        {t('auth.forgotPassword.successDescription')} {'\n\n'}
        {t('auth.forgotPassword.twoFactorPrefix')}{' '}
        <Text style={styles.link} onPress={() => replace('/(auth)/login')}>
          {t('auth.forgotPassword.twoFactorLink')}
        </Text>
        . {t('auth.forgotPassword.twoFactorSuffix')}
      </Text>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={onContinue || (() => replace('/(auth)/login'))}
        accessibilityLabel="success-reset-password_continue_button"
      >
        <Text style={styles.buttonText}>{t('auth.forgotPassword.continueButton')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: Theme, scaleWidth: number, scaleHeight: number, fontScale: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
      paddingHorizontal: theme.spacing.xl * scaleWidth,
      paddingTop: (theme.spacing.xxl * 2 + theme.spacing.lg) * scaleHeight,
      justifyContent: 'flex-start',
    },
    title: {
      color: theme.colors.text.primary,
      fontSize: (theme.typography.sizes.xxl + 1) * fontScale,
      fontFamily: theme.typography.fonts.bold,
      lineHeight: 40 * fontScale,
      marginBottom: theme.spacing.xxl * scaleHeight,
      letterSpacing: -0.3,
    },
    subtitle: {
      color: theme.colors.text.secondary,
      fontSize: (theme.typography.sizes.lg - 3) * fontScale,
      lineHeight: 20 * fontScale,
      marginBottom: (theme.spacing.xxl * 2 + theme.spacing.lg) * scaleHeight,
      textAlign: 'left',
    },
    link: {
      color: theme.colors.text.link,
    },
    button: {
      backgroundColor: theme.colors.background.inverse,
      paddingVertical: theme.spacing.md * scaleHeight,
      paddingHorizontal: theme.spacing.xxl * scaleWidth,
      borderRadius: theme.borderRadius.full,
      width: '100%',
      marginTop: theme.spacing.xl * scaleHeight,
    },
    buttonText: {
      color: theme.colors.background.primary,
      fontSize: theme.typography.sizes.md * fontScale,
      fontFamily: theme.typography.fonts.bold,
      textAlign: 'center',
    },
  });

export default SuccessResetPassword;
