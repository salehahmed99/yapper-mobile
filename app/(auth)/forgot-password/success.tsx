import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import SuccessScreen from '@/src/modules/auth/components/forgetPassword/SuccessResetPassword';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { useForgotPasswordStore } from '@/src/modules/auth/store/useForgetPasswordStore';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

const SuccessResetPasswordScreen = () => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const reset = useForgotPasswordStore((state) => state.reset);

  // Clear store data on success
  useEffect(() => {
    // Clean up store after a short delay (optional)
    const timer = setTimeout(() => {
      reset();
    }, 1000);

    return () => clearTimeout(timer);
  }, [reset]);

  const handleTopBarBackPress = () => {
    router.replace('/(auth)/landing-screen');
  };

  return (
    <View style={styles.container}>
      <TopBar onBackPress={handleTopBarBackPress} />
      <View style={styles.content}>
        <SuccessScreen />
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
