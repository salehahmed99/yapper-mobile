import ActivityLoader from '@/src/components/ActivityLoader';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import { AnimatedTextInput } from '@/src/modules/settings/components/AnimatedTextInput';
import { SettingsTopBar } from '@/src/modules/settings/components/SettingsTopBar';
import ValidationItem from '@/src/modules/settings/components/ValidationItem';
import { changePassword, confirmCurrentPassword } from '@/src/modules/settings/services/yourAccountService';
import { passwordSchema } from '@/src/modules/settings/types/schemas';
import { isPasswordValid, validatePassword } from '@/src/modules/settings/utils/passwordValidation';
import { useAuthStore } from '@/src/store/useAuthStore';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export const ChangePasswordScreen: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { navigate, goBack } = useNavigation();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showValidation, setShowValidation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordValidation = useMemo(() => validatePassword(passwords.new), [passwords.new]);

  const passwordIsValid = isPasswordValid(passwords.new);
  const passwordsMatch = !passwords.confirm || passwords.new === passwords.confirm;
  const isFormValid = passwords.current && passwordIsValid && passwordsMatch && passwords.confirm;

  const showToast = (type: 'success' | 'error', text1: string, text2: string) => {
    Toast.show({ type, text1, text2 });
  };

  const handleUpdatePassword = async () => {
    if (!isPasswordValid(passwords.new) || !passwordsMatch) {
      showToast(
        'error',
        t('settings.password.error_invalid_title'),
        !passwordIsValid ? t('settings.password.error_requirements') : t('settings.password.error_mismatch'),
      );
      return;
    }

    const schemaValidation = passwordSchema.safeParse({ newPassword: passwords.new });
    if (!schemaValidation.success) {
      showToast(
        'error',
        t('settings.password.error_invalid_title'),
        schemaValidation.error.errors[0]?.message || t('settings.password.error_requirements'),
      );
      return;
    }

    try {
      setIsLoading(true);
      await confirmCurrentPassword({ password: passwords.current });
      await changePassword({ oldPassword: passwords.current, newPassword: passwords.new });

      showToast('success', t('settings.common.success'), t('settings.password.success_message'));
      setPasswords({ current: '', new: '', confirm: '' });
      setShowValidation(false);
    } catch (error) {
      showToast(
        'error',
        t('settings.common.error'),
        error instanceof Error ? error.message : t('settings.common.unexpected_error'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    useAuthStore.getState().setSkipRedirect(true);
    const { useForgotPasswordStore } = require('@/src/modules/auth/store/useForgetPasswordStore');
    useForgotPasswordStore.getState().setReturnRoute('/(protected)/(settings)/your-account/changePassword');
    navigate('/(auth)/forgot-password/find-account');
  };

  return (
    <>
      <ActivityLoader visible={isLoading} message={t('settings.password.loading')} />
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background.primary}
        />
        <View style={styles.container}>
          <SettingsTopBar
            title={t('settings.password.title')}
            subtitle={`@${user?.username}`}
            onBackPress={() => goBack()}
          />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('settings.password.current_password')}</Text>
              <AnimatedTextInput
                value={passwords.current}
                onChangeText={(text) => setPasswords((prev) => ({ ...prev, current: text }))}
                placeholder=""
                placeholderTextColor={theme.colors.text.tertiary}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Current password input"
                testID="current-password-input"
                showPasswordToggle
              />
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('settings.password.new_password')}</Text>
              <AnimatedTextInput
                value={passwords.new}
                onChangeText={(text) => {
                  setPasswords((prev) => ({ ...prev, new: text }));
                  if (text.length > 0) setShowValidation(true);
                }}
                placeholder={t('settings.password.new_password_placeholder')}
                placeholderTextColor={theme.colors.text.tertiary}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="New password input"
                testID="new-password-input"
                showPasswordToggle
              />

              {showValidation && (
                <View style={styles.validationContainer}>
                  <Text style={styles.validationTitle}>{t('settings.password.validation_title')}</Text>
                  {passwordValidation.map((rule) => (
                    <ValidationItem key={rule.key} isValid={rule.isValid} text={rule.text} theme={theme} />
                  ))}
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('settings.password.confirm_password')}</Text>
              <AnimatedTextInput
                value={passwords.confirm}
                onChangeText={(text) => setPasswords((prev) => ({ ...prev, confirm: text }))}
                placeholder={t('settings.password.confirm_password_placeholder')}
                placeholderTextColor={theme.colors.text.tertiary}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Confirm password input"
                testID="confirm-password-input"
                showPasswordToggle
              />
              {!passwordsMatch && passwords.confirm && (
                <Text style={styles.errorText}>{t('settings.password.passwords_mismatch')}</Text>
              )}
              {passwordsMatch && passwords.confirm && isPasswordValid(passwords.new) && (
                <Text style={styles.successText}>{t('settings.password.passwords_match')}</Text>
              )}
            </View>

            {/* Update Button */}
            <TouchableOpacity
              style={[styles.updateButton, !isFormValid && styles.updateButtonDisabled]}
              onPress={handleUpdatePassword}
              disabled={!isFormValid}
              accessibilityLabel="Update password button"
              testID="update-password-button"
            >
              <Text style={[styles.updateButtonText, !isFormValid && styles.updateButtonTextDisabled]}>
                {t('settings.password.update_button')}
              </Text>
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordContainer}
              accessibilityLabel="Forgot password link"
              testID="forgot-password-link"
            >
              <Text style={styles.forgotPasswordText}>{t('settings.password.forgot_password')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background.primary },
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    scrollView: { flex: 1 },
    scrollViewContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.xxl,
    },
    inputGroup: { marginBottom: theme.spacing.xl },
    label: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.sm,
      textAlign: 'left',
    },
    validationContainer: { marginTop: theme.spacing.md, paddingVertical: theme.spacing.sm },
    validationTitle: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
      fontFamily: theme.typography.fonts.medium,
      textAlign: 'left',
    },
    updateButton: {
      backgroundColor: theme.colors.text.link,
      borderRadius: theme.borderRadius.fullRounded,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      marginTop: theme.spacing.xl,
    },
    updateButtonDisabled: { opacity: 0.6 },
    updateButtonText: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
    },
    updateButtonTextDisabled: { color: theme.colors.text.primary },
    forgotPasswordContainer: { alignItems: 'center', paddingVertical: theme.spacing.md },
    forgotPasswordText: { fontSize: theme.typography.sizes.sm, color: theme.colors.text.secondary },
    errorText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
      textAlign: 'left',
    },
    successText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.success,
      marginTop: theme.spacing.xs,
      textAlign: 'left',
    },
  });

export default ChangePasswordScreen;
