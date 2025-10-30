import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import AuthInputScreen from '@/src/modules/auth/components/shared/AuthInput';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import ActivityLoader from '@/src/components/ActivityLoader';
import { requestForgetPassword } from '@/src/modules/auth/services/forgetPasswordService';
import { useForgotPasswordStore } from '@/src/modules/auth/store/useForgetPasswordStore';
import { ButtonOptions } from '@/src/modules/auth/utils/enums';

const FindAccountScreen = () => {
  const { t } = useTranslation();

  // Zustand store
  const identifier = useForgotPasswordStore((state) => state.identifier);
  const setIdentifier = useForgotPasswordStore((state) => state.setIdentifier);
  const detectTextType = useForgotPasswordStore((state) => state.detectTextType);
  const textType = useForgotPasswordStore((state) => state.textType);
  const reset = useForgotPasswordStore((state) => state.reset);

  const [inputValue, setInputValue] = useState(identifier);
  const [isLoading, setIsLoading] = useState(false);
  const [isNextEnabled, setIsNextEnabled] = useState(false);

  // Reset store on mount (fresh start)
  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    const type = detectTextType(inputValue);
    setIsNextEnabled(!!type);
  }, [inputValue, detectTextType]);

  const handleNext = async () => {
    if (!textType) {
      Toast.show({
        type: 'error',
        text1: t('auth.forgotPassword.invalidInputTitle'),
        text2: t('auth.forgotPassword.invalidInputDescription'),
      });
      return;
    }

    setIsLoading(true);
    try {
      const isEmailSent = await requestForgetPassword({ identifier: inputValue });

      if (isEmailSent) {
        setIdentifier(inputValue); // Save to Zustand store
        Toast.show({
          type: 'success',
          text1: t('auth.forgotPassword.codeSentTitle'),
          text2: t('auth.forgotPassword.codeSentDescription'),
        });
        router.replace('/(auth)/forgot-password/verify-code');
      } else {
        Toast.show({
          type: 'error',
          text1: t('auth.forgotPassword.codeSendErrorTitle'),
          text2: t('auth.forgotPassword.codeSendErrorDescription'),
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('auth.forgotPassword.genericError');
      Toast.show({ type: 'error', text1: t('auth.forgotPassword.errorTitle'), text2: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopBarBackPress = () => {
    router.replace('/(auth)');
  };

  return (
    <>
      <ActivityLoader visible={isLoading} message={t('activityLoader.sendingCode')} />
      <TopBar onBackPress={handleTopBarBackPress} />
      <AuthInputScreen
        title={t('auth.forgotPassword.findAccountTitle')}
        description={t('auth.forgotPassword.findAccountDescription')}
        label={t('auth.login.emailLabel')}
        value={inputValue}
        onChange={setInputValue}
      />
      <BottomBar
        rightButton={{
          label: ButtonOptions.NEXT,
          onPress: handleNext,
          enabled: isNextEnabled,
          visible: true,
          type: 'primary',
        }}
      />
    </>
  );
};

export default FindAccountScreen;
