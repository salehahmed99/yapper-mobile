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

export const ChangePasswordScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordError, setShowPasswordError] = useState(false);

  const isFormValid = currentPassword.length > 0 && newPassword.length >= 8 && confirmPassword.length >= 8;

  const handleUpdatePassword = async () => {
    // Validate password match first
    if (newPassword !== confirmPassword) {
      setShowPasswordError(true);
      return;
    }

    setShowPasswordError(false);

    try {
      // Step 1: Confirm current password
      await confirmCurrentPassword({ password: currentPassword });

      // Step 2: Change password
      await changePassword({
        oldPassword: currentPassword,
        newPassword: newPassword,
      });

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Your password has been updated',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  };

  const handleForgotPassword = () => {
    useAuthStore.getState().setSkipRedirect(true);
    const { useForgotPasswordStore } = require('@/src/modules/auth/store/useForgetPasswordStore');
    useForgotPasswordStore.getState().setReturnRoute('/(protected)/(settings)/your-account/changePassword');
    router.push('/(auth)/forgot-password/find-account');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />
      <View style={styles.container}>
        {/* Header */}
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
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder=""
              placeholderTextColor={theme.colors.text.tertiary}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New password</Text>
            <AnimatedTextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="At least 8 characters"
              placeholderTextColor={theme.colors.text.tertiary}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm password</Text>
            <AnimatedTextInput
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (showPasswordError) setShowPasswordError(false);
              }}
              placeholder="At least 8 characters"
              placeholderTextColor={theme.colors.text.tertiary}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            {showPasswordError && <Text style={styles.errorText}>Passwords do not match</Text>}
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={[styles.updateButton, !isFormValid && styles.updateButtonDisabled]}
            onPress={handleUpdatePassword}
            disabled={!isFormValid}
          >
            <Text style={[styles.updateButtonText, !isFormValid && styles.updateButtonTextDisabled]}>
              Update password
            </Text>
          </TouchableOpacity>

          {/* Forgot Password Link */}
          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.xxl,
    },
    inputGroup: {
      marginBottom: theme.spacing.xl,
    },
    label: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.sm,
    },
    updateButton: {
      backgroundColor: theme.colors.text.link,
      borderRadius: theme.borderRadius.fullRounded,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      marginTop: theme.spacing.xl,
    },
    updateButtonDisabled: {
      backgroundColor: theme.colors.text.link,
      opacity: 0.6,
    },
    updateButtonText: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
    },
    updateButtonTextDisabled: {
      color: theme.colors.text.primary,
    },
    forgotPasswordContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    forgotPasswordText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
    },
    errorText: {
      fontSize: theme.typography.sizes.sm,
      color: '#FF3B30',
      marginTop: theme.spacing.xs,
    },
    AnimatedView: {
      borderBottomWidth: 1,
    },
  });

export default ChangePasswordScreen;
