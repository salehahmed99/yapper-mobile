import ActivityLoader from '@/src/components/ActivityLoader';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import SuccessScreen from '@/src/modules/auth/components/forgetPassword/SuccessResetPassword';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { login } from '@/src/modules/auth/services/authService';
import { useForgotPasswordStore } from '@/src/modules/auth/store/useForgetPasswordStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';

const SuccessResetPasswordScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const { identifier, textType, newPassword, reset } = useForgotPasswordStore();
  const loginUser = useAuthStore((state) => state.loginUser);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!identifier || !newPassword || !textType) {
      reset();
      router.replace('/(auth)/login');
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
        await loginUser(response.data.user, response.data.accessToken);
        reset();
        router.replace('/(protected)');
      }
    } catch (error) {
      console.error('Auto-login failed:', error);
      Toast.show({
        type: 'info',
        text1: 'Password Reset Successful',
        text2: 'Please login with your new password',
      });
      reset();
      router.replace('/(auth)/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopBarBackPress = () => {
    router.replace('/(auth)/landing-screen');
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
