import React, { useMemo, useState } from 'react';
import { View, StyleSheet, StatusBar, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { changeEmail } from '@/src/modules/settings/services/yourAccountService';
import { Theme } from '@/src/constants/theme';
import Toast from 'react-native-toast-message';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import AuthInput from '@/src/modules/auth/components/shared/AuthInput';
import ActivityLoader from '@/src/components/ActivityLoader';
import { useAuthStore } from '@/src/store/useAuthStore';
import { emailSchema } from '@/src/modules/auth/schemas/schemas';

export const UpdateEmailScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentEmail = user?.email || '';

  const validateEmail = (email: string): boolean => {
    return emailSchema.safeParse(email).success;
  };

  const isEmailValid = email.length > 0 ? validateEmail(email) : true;
  const isFormValid = email.length > 0 && isEmailValid && email !== currentEmail && !isLoading;

  const handleUpdate = async () => {
    if (!isFormValid) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address',
      });
      return;
    }

    setIsLoading(true);
    try {
      await changeEmail(email);
      Toast.show({
        type: 'success',
        text1: 'Email Updated',
        text2: 'Your email has been updated successfully',
      });
      router.push({
        pathname: '/(protected)/(settings)/your-account/account-information/confirm-email-change',
        params: { email },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error instanceof Error ? error?.message : 'Failed to update email. Please try again.',
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ActivityLoader visible={isLoading} />
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />
      <TopBar showExitButton={false} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Change email</Text>

          <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
            Your current email is {currentEmail}. What would you like to update it to? Your email is not displayed in
            your public profile on X.
          </Text>

          <Text style={[styles.warning, { color: theme.colors.text.secondary }]}>
            If you change your email address, any existing Google SSO connections will be removed. Review Connected
            accounts <Text style={[styles.link, { color: theme.colors.text.link }]}>here</Text>.
          </Text>

          <View style={styles.inputContainer}>
            <AuthInput
              description=""
              label="Email address"
              value={email}
              onChange={setEmail}
              status={
                email.length > 0 && !isEmailValid ? 'error' : email.length > 0 && isEmailValid ? 'success' : 'none'
              }
              showCheck={email.length > 0 && isEmailValid}
              errorMessage={email.length > 0 && !isEmailValid ? 'Please enter a valid email address' : ''}
              type="text"
            />
          </View>
        </View>
      </ScrollView>

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
          onPress: handleUpdate,
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
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      marginBottom: theme.spacing.md,
      fontFamily: theme.typography.fonts.bold,
      paddingLeft: theme.spacing.xl,
    },
    description: {
      fontSize: theme.typography.sizes.md,
      lineHeight: 20,
      marginBottom: theme.spacing.lg,
      fontFamily: theme.typography.fonts.regular,
      paddingLeft: theme.spacing.xl,
    },
    warning: {
      fontSize: theme.typography.sizes.md,
      lineHeight: 20,
      marginBottom: theme.spacing.xl,
      fontFamily: theme.typography.fonts.regular,
      paddingLeft: theme.spacing.xl,
    },
    link: {
      fontFamily: theme.typography.fonts.regular,
    },
    inputContainer: {
      marginBottom: theme.spacing.xl,
    },
    checkboxContainer: {
      marginTop: theme.spacing.md,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    textContainer: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    checkboxText: {
      fontSize: theme.typography.sizes.md,
      lineHeight: 20,
      fontFamily: theme.typography.fonts.regular,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default UpdateEmailScreen;
