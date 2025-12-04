import React, { useMemo, useState } from 'react';
import { View, StyleSheet, StatusBar, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { confirmCurrentPassword } from '@/src/modules/settings/services/yourAccountService';
import { Theme } from '@/src/constants/theme';
import Toast from 'react-native-toast-message';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import PasswordInput from '@/src/modules/auth/components/shared/PasswordInput';
import ActivityLoader from '@/src/components/ActivityLoader';

export const VerifyPasswordScreen: React.FC = () => {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Password Required',
        text2: 'Please enter your password',
      });
      return;
    }

    setIsLoading(true);
    try {
      const isValid = await confirmCurrentPassword({ password });

      if (isValid) {
        Toast.show({
          type: 'success',
          text1: 'Password Verified',
          text2: 'Password verification successful',
        });

        // Navigate to the return destination or back
        if (returnTo) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          router.push(returnTo as any);
        } else {
          router.back();
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Invalid Password',
          text2: 'The password you entered is incorrect',
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: 'Failed to verify password. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const isFormValid = password.length > 0 && !isLoading;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ActivityLoader visible={isLoading} />
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />
      <TopBar showExitButton={false} />

      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Verify your password</Text>
          <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
            Re-enter your X password to continue.
          </Text>

          <View style={styles.inputContainer}>
            <PasswordInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              onToggleVisibility={() => setIsPasswordVisible(!isPasswordVisible)}
              isVisible={isPasswordVisible}
              showCheck={false}
            />
          </View>
        </View>
      </View>

      <BottomBar
        leftButton={{
          label: 'Cancel',
          onPress: handleCancel,
          enabled: !isLoading,
          visible: true,
          type: 'secondary',
        }}
        rightButton={{
          label: 'Next',
          onPress: handleVerify,
          enabled: isFormValid,
          visible: true,
          type: 'primary',
        }}
      />
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
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.xl,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      marginBottom: theme.spacing.md,
      fontFamily: theme.typography.fonts.bold,
    },
    description: {
      fontSize: theme.typography.sizes.md,
      lineHeight: 20,
      marginBottom: theme.spacing.xl,
      fontFamily: theme.typography.fonts.regular,
    },
    inputContainer: {
      marginTop: theme.spacing.md,
    },
  });

export default VerifyPasswordScreen;
