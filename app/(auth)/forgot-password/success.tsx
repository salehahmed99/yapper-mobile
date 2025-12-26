import ActivityLoader from '@/src/components/ActivityLoader';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import SuccessScreen from '@/src/modules/auth/components/forgetPassword/SuccessResetPassword';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { login } from '@/src/modules/auth/services/authService';
import { useForgotPasswordStore } from '@/src/modules/auth/store/useForgetPasswordStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

const SuccessResetPasswordScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { replace, goBack } = useNavigation();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const { identifier, textType, newPassword, reset } = useForgotPasswordStore();
  const loginUser = useAuthStore((state) => state.loginUser);
  const setSkipRedirect = useAuthStore((state) => state.setSkipRedirect);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!identifier || !newPassword || !textType) {
      reset();
      replace('/(auth)/login');
      return;
    }

    setIsLoading(true);
    try {
      let type: 'email' | 'username' | 'phone_number' = 'email';
      if (textType === 'phone') type = 'phone_number';
      else if (textType === 'username') type = 'username';
      else if (textType === 'email') type = 'email';

      const response = await login({
        identifier,
        type,
        password: newPassword,
      });

      if (response.data?.user && response.data?.accessToken) {
        await loginUser(response.data.user, response.data.accessToken, response.data.refreshToken);
        setSkipRedirect(false);
        reset();
        replace('/(protected)');
      }
    } catch (error) {
      console.error('Auto-login failed:', error);
      Toast.show({
        type: 'info',
        text1: 'Password Reset Successful',
        text2: 'Please login with your new password',
      });
      reset();
      replace('/(auth)/login');
    } finally {
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
      <ActivityLoader visible={isLoading} message={t('auth.forgotPassword.loggingIn')} />
      <TopBar onBackPress={handleTopBarBackPress} />
      <View style={styles.content}>
        <SuccessScreen onContinue={handleContinue} />
      </View>
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

export default SuccessResetPasswordScreen;
