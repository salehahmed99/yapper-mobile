import ActivityLoader from '@/src/components/ActivityLoader';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import AuthInputScreen from '@/src/modules/auth/components/shared/AuthInput';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import AuthTitle from '@/src/modules/auth/components/shared/Title';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { verifyOTP } from '@/src/modules/auth/services/forgetPasswordService';
import { useForgotPasswordStore } from '@/src/modules/auth/store/useForgetPasswordStore';
import { ButtonOptions } from '@/src/modules/auth/utils/enums';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

const VerifyCodeScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { replace, goBack } = useNavigation();

  const styles = React.useMemo(() => createStyles(theme), [theme]);

  // Zustand store
  const identifier = useForgotPasswordStore((state) => state.identifier);
  const setResetToken = useForgotPasswordStore((state) => state.setResetToken);

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNextEnabled, setIsNextEnabled] = useState(false);

  // Redirect if no identifier (user shouldn't be here)
  useEffect(() => {
    if (!identifier) {
      replace('/(auth)/forgot-password/find-account');
    }
  }, [identifier, replace]);

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
        replace('/(auth)/forgot-password/reset-password');
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
    replace('/(auth)/forgot-password/find-account');
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
      <ActivityLoader visible={isLoading} message={t('activityLoader.verifyingCode')} />
      <TopBar onBackPress={handleTopBarBackPress} />
      <View style={styles.content}>
        <AuthTitle title={t('auth.forgotPassword.verifyCodeTitle')} />
        <AuthInputScreen
          description={t('auth.forgotPassword.verifyCodeDescription')}
          label={t('auth.forgotPassword.verificationCodeLabel')}
          value={code}
          onChange={setCode}
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
        leftButton={{
          label: ButtonOptions.BACK,
          onPress: handleBack,
          enabled: true,
          visible: true,
          type: 'secondary',
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

export default VerifyCodeScreen;
