import ActivityLoader from '@/src/components/ActivityLoader';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import AuthInputScreen from '@/src/modules/auth/components/shared/AuthInput';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import AuthTitle from '@/src/modules/auth/components/shared/Title';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { requestForgetPassword } from '@/src/modules/auth/services/forgetPasswordService';
import { useForgotPasswordStore } from '@/src/modules/auth/store/useForgetPasswordStore';
import { ButtonOptions } from '@/src/modules/auth/utils/enums';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

const FindAccountScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { replace, goBack } = useNavigation();

  const styles = React.useMemo(() => createStyles(theme), [theme]);

  // Zustand store
  const identifier = useForgotPasswordStore((state) => state.identifier);
  const setIdentifier = useForgotPasswordStore((state) => state.setIdentifier);
  const detectTextType = useForgotPasswordStore((state) => state.detectTextType);
  const textType = useForgotPasswordStore((state) => state.textType);
  const reset = useForgotPasswordStore((state) => state.reset);

  const [inputValue, setInputValue] = useState(identifier);
  const [isLoading, setIsLoading] = useState(false);
  const [isNextEnabled, setIsNextEnabled] = useState(false);

  // Reset store on mount (fresh start) but preserve returnRoute
  useEffect(() => {
    const currentReturnRoute = useForgotPasswordStore.getState().returnRoute;
    reset();
    if (currentReturnRoute) {
      useForgotPasswordStore.getState().setReturnRoute(currentReturnRoute);
    }
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
    setIsNextEnabled(false);
    try {
      const isEmailSent = await requestForgetPassword({ identifier: inputValue });

      if (isEmailSent) {
        setIdentifier(inputValue); // Save to Zustand store
        Toast.show({
          type: 'success',
          text1: t('auth.forgotPassword.codeSentTitle'),
          text2: t('auth.forgotPassword.codeSentDescription'),
        });
        replace('/(auth)/forgot-password/verify-code');
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
      setIsNextEnabled(true);
      setIsLoading(false);
    }
  };

  const handleTopBarBackPress = () => {
    const returnRoute = useForgotPasswordStore.getState().returnRoute;
    if (returnRoute) {
      useForgotPasswordStore.getState().setReturnRoute(null);
      goBack();
    } else {
      replace('/(auth)/landing-screen');
    }
  };

  return (
    <View style={styles.container}>
      <ActivityLoader visible={isLoading} message={t('activityLoader.sendingCode')} />
      <TopBar onBackPress={handleTopBarBackPress} />
      <View style={styles.content}>
        <AuthTitle title={t('auth.forgotPassword.findAccountTitle')} />
        <AuthInputScreen
          description={t('auth.forgotPassword.findAccountDescription')}
          label={t('auth.login.emailLabel')}
          value={inputValue}
          onChange={setInputValue}
        />
      </View>
      <BottomBar
        rightButton={{
          label: ButtonOptions.NEXT,
          onPress: handleNext,
          enabled: isNextEnabled,
          visible: true,
          type: 'primary',
        }}
      />
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    content: {
      flex: 1,
      justifyContent: 'flex-start',
    },
  });

export default FindAccountScreen;
