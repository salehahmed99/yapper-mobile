import ActivityLoader from '@/src/components/ActivityLoader';
import ResetPassword from '@/src/modules/auth/components/forgetPassword/ResetPassword';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { passwordSchema } from '@/src/modules/auth/schemas/schemas';
import { resetPassword } from '@/src/modules/auth/services/forgetPasswordService';
import { useForgotPasswordStore } from '@/src/modules/auth/store/useForgetPasswordStore';
import { ButtonOptions } from '@/src/modules/auth/utils/enums';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';

const ResetPasswordScreen = () => {
  const { t } = useTranslation();

  // Zustand store
  const identifier = useForgotPasswordStore((state) => state.identifier);
  const resetToken = useForgotPasswordStore((state) => state.resetToken);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNextEnabled, setIsNextEnabled] = useState(false);

  // Redirect if no token
  useEffect(() => {
    if (!identifier || !resetToken) {
      router.replace('/(auth)/forgot-password/find-account');
    }
  }, [identifier, resetToken]);

  useEffect(() => {
    const passwordsMatch = newPassword === confirmPassword;
    const passwordLengthValid = newPassword.length >= 8;
    setIsNextEnabled(passwordsMatch && passwordLengthValid);
  }, [newPassword, confirmPassword]);

  const handleNext = async () => {
    // Validation
    if (newPassword.length < 8) {
      Toast.show({
        type: 'error',
        text1: t('auth.forgotPassword.weakPasswordTitle'),
        text2: t('auth.forgotPassword.weakPasswordDescription'),
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: t('auth.forgotPassword.passwordMismatchTitle'),
        text2: t('auth.forgotPassword.passwordMismatchDescription'),
      });
      return;
    }

    if (!passwordSchema.safeParse(newPassword).success) {
      Alert.alert(t('auth.forgotPassword.invalidPasswordTitle'), t('auth.forgotPassword.invalidPasswordDescription'));
      return;
    }

    setIsNextEnabled(false);

    setIsLoading(true);
    try {
      const succeeded = await resetPassword({
        resetToken,
        newPassword,
        identifier,
      });

      if (succeeded) {
        Toast.show({
          type: 'success',
          text1: t('auth.forgotPassword.successTitle'),
          text2: t('auth.forgotPassword.successDescription'),
        });
        router.replace('/(auth)/forgot-password/success');
      } else {
        Toast.show({
          type: 'error',
          text1: t('auth.forgotPassword.errorTitle'),
          text2: t('auth.forgotPassword.errorDescription'),
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('auth.forgotPassword.genericError');
      Toast.show({ type: 'error', text1: t('auth.forgotPassword.errorTitle'), text2: message });
    } finally {
      setIsLoading(false);
      setIsNextEnabled(true);
    }
  };

  const handleBack = () => {
    router.replace('/(auth)/forgot-password/verify-code');
  };

  const handleTopBarBackPress = () => {
    router.replace('/(auth)/landing-screen');
  };

  return (
    <>
      <ActivityLoader visible={isLoading} message={t('auth.forgotPassword.resettingPassword')} />
      <TopBar onBackPress={handleTopBarBackPress} />
      <ResetPassword
        userIdentifier={identifier}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        onNewPasswordChange={setNewPassword}
        onConfirmPasswordChange={setConfirmPassword}
        onToggleNewPasswordVisibility={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
        onToggleConfirmPasswordVisibility={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
        isNewPasswordVisible={isNewPasswordVisible}
        isConfirmPasswordVisible={isConfirmPasswordVisible}
      />
      <BottomBar
        rightButton={{
          label: ButtonOptions.NEXT,
          onPress: handleNext,
          enabled: isNextEnabled,
          visible: true,
          type: 'primary',
        }}
        leftButton={{
          label: ButtonOptions.BACK,
          onPress: handleBack,
          enabled: true,
          visible: true,
          type: 'secondary',
        }}
      />
    </>
  );
};

export default ResetPasswordScreen;
