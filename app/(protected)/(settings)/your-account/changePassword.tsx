import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { SettingsTopBar } from '@/src/modules/settings/components/SettingsTopBar';
import { AnimatedTextInput } from '@/src/modules/settings/components/AnimatedTextInput';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useTheme } from '@/src/context/ThemeContext';
import { Theme } from '@/src/constants/theme';
import { confirmCurrentPassword, changePassword } from '@/src/modules/settings/services/yourAccountService';
import Toast from 'react-native-toast-message';
import ActivityLoader from '@/src/components/ActivityLoader';
import { passwordSchema } from '@/src/modules/settings/types/schemas';
import ValidationItem from '@/src/modules/settings/components/ValidationItem';
import { validatePassword, isPasswordValid } from '@/src/modules/settings/utils/passwordValidation';

export const ChangePasswordScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
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
        'Invalid Password',
        !passwordIsValid ? 'Please meet all password requirements' : 'Passwords do not match',
      );
      return;
    }

    const schemaValidation = passwordSchema.safeParse({ newPassword: passwords.new });
    if (!schemaValidation.success) {
      showToast(
        'error',
        'Invalid Password',
        schemaValidation.error.errors[0]?.message || 'Please meet all password requirements',
      );
      return;
    }

    try {
      setIsLoading(true);
      await confirmCurrentPassword({ password: passwords.current });
      await changePassword({ oldPassword: passwords.current, newPassword: passwords.new });

      showToast('success', 'Success', 'Your password has been updated');
      setPasswords({ current: '', new: '', confirm: '' });
      setShowValidation(false);
    } catch (error) {
      showToast('error', 'Error', error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    useAuthStore.getState().setSkipRedirect(true);
    const { useForgotPasswordStore } = require('@/src/modules/auth/store/useForgetPasswordStore');
    useForgotPasswordStore.getState().setReturnRoute('/(protected)/(settings)/your-account/changePassword');
    router.push('/(auth)/forgot-password/find-account');
  };

  return (
    <>
      <ActivityLoader visible={isLoading} message="Changing your password..." />
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background.primary}
        />
        <View style={styles.container}>
          <SettingsTopBar
            title="Change your password"
            subtitle={`@${user?.username}`}
            onBackPress={() => router.back()}
          />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current password</Text>
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
              <Text style={styles.label}>New password</Text>
              <AnimatedTextInput
                value={passwords.new}
                onChangeText={(text) => {
                  setPasswords((prev) => ({ ...prev, new: text }));
                  if (text.length > 0) setShowValidation(true);
                }}
                placeholder="Enter new password"
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
                  <Text style={styles.validationTitle}>Password must contain:</Text>
                  {passwordValidation.map((rule) => (
                    <ValidationItem key={rule.key} isValid={rule.isValid} text={rule.text} theme={theme} />
                  ))}
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm password</Text>
              <AnimatedTextInput
                value={passwords.confirm}
                onChangeText={(text) => setPasswords((prev) => ({ ...prev, confirm: text }))}
                placeholder="Re-enter new password"
                placeholderTextColor={theme.colors.text.tertiary}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Confirm password input"
                testID="confirm-password-input"
                showPasswordToggle
              />
              {!passwordsMatch && passwords.confirm && <Text style={styles.errorText}>Passwords do not match</Text>}
              {passwordsMatch && passwords.confirm && isPasswordValid(passwords.new) && (
                <Text style={styles.successText}>Passwords match ✓</Text>
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
                Update password
              </Text>
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordContainer}
              accessibilityLabel="Forgot password link"
              testID="forgot-password-link"
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
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
    label: { fontSize: theme.typography.sizes.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing.sm },
    validationContainer: { marginTop: theme.spacing.md, paddingVertical: theme.spacing.sm },
    validationTitle: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
      fontFamily: theme.typography.fonts.medium,
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
    errorText: { fontSize: theme.typography.sizes.sm, color: theme.colors.error, marginTop: theme.spacing.xs },
    successText: { fontSize: theme.typography.sizes.sm, color: theme.colors.success, marginTop: theme.spacing.xs },
  });

export default ChangePasswordScreen;
