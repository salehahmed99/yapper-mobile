import ActivityLoader from '@/src/components/ActivityLoader';
import AuthInputScreen from '@/src/modules/auth/components/shared/AuthInput';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { verifyOTP } from '@/src/modules/auth/services/forgetPasswordService';
import { useForgotPasswordStore } from '@/src/modules/auth/store/useForgetPasswordStore';
import { ButtonOptions } from '@/src/modules/auth/utils/enums';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';

const VerifyCodeScreen = () => {
  const { t } = useTranslation();

  // Zustand store
  const identifier = useForgotPasswordStore((state) => state.identifier);
  const setResetToken = useForgotPasswordStore((state) => state.setResetToken);

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNextEnabled, setIsNextEnabled] = useState(false);

  // Redirect if no identifier (user shouldn't be here)
  useEffect(() => {
    if (!identifier) {
      router.replace('/(auth)/forgot-password/find-account');
    }
  }, [identifier]);

  useEffect(() => {
    setIsNextEnabled(code.trim().length === 6);
  }, [code]);

  const handleNext = async () => {
    if (code.trim().length !== 6) {
      Toast.show({
        type: 'error',
        text1: t('auth.forgotPassword.invalidCodeTitle'),
        text2: t('auth.forgotPassword.invalidCodeDescription'),
      });
      return;
    }

    setIsLoading(true);
    setIsNextEnabled(false);
    try {
      const token = await verifyOTP({ identifier, token: code });

      if (token && token.length > 0) {
        setResetToken(token); // Save to Zustand store
        Toast.show({
          type: 'success',
          text1: t('auth.forgotPassword.codeVerifiedTitle'),
          text2: t('auth.forgotPassword.codeVerifiedDescription'),
        });
        router.replace('/(auth)/forgot-password/reset-password');
      } else {
        Toast.show({
          type: 'error',
          text1: t('auth.forgotPassword.codeInvalidTitle'),
          text2: t('auth.forgotPassword.codeInvalidDescription'),
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('auth.forgotPassword.genericError');
      Toast.show({ type: 'error', text1: t('auth.forgotPassword.errorTitle'), text2: message });
    } finally {
      setIsNextEnabled(true);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.replace('/(auth)/forgot-password/find-account');
  };

  const handleTopBarBackPress = () => {
    router.replace('/(auth)/landing-screen');
  };
  return (
    <>
      <ActivityLoader visible={isLoading} message={t('activityLoader.verifyingCode')} />
      <TopBar onBackPress={handleTopBarBackPress} />
      <AuthInputScreen
        title={t('auth.forgotPassword.verifyCodeTitle')}
        description={t('auth.forgotPassword.verifyCodeDescription')}
        label={t('auth.forgotPassword.verificationCodeLabel')}
        value={code}
        onChange={setCode}
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

export default VerifyCodeScreen;
