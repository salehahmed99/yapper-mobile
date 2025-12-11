import ActivityLoader from '@/src/components/ActivityLoader';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import PasswordInput from '@/src/modules/auth/components/shared/PasswordInput';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { passwordSchema } from '@/src/modules/auth/schemas/schemas';
import { confirmCurrentPassword } from '@/src/modules/settings/services/yourAccountService';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export const VerifyPasswordScreen: React.FC = () => {
  const { t } = useTranslation();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isPasswordValid = passwordSchema.safeParse(password).success;

  const handleVerify = async () => {
    if (!password.trim()) {
      Toast.show({
        type: 'error',
        text1: t('settings.verify_password.required_error'),
        text2: t('settings.verify_password.required_message'),
      });
      return;
    }

    setIsLoading(true);
    try {
      const isValid = await confirmCurrentPassword({ password });

      if (isValid) {
        Toast.show({
          type: 'success',
          text1: t('settings.verify_password.verified'),
          text2: t('settings.verify_password.verified_message'),
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
          text1: t('settings.verify_password.invalid_title'),
          text2: t('settings.verify_password.invalid_message'),
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('settings.verify_password.failed_title'),
        text2: t('settings.verify_password.failed_message'),
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
    <SafeAreaView style={styles.safeArea}>
      <ActivityLoader visible={isLoading} />
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />
      <TopBar showExitButton={false} />

      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {t('settings.verify_password.title')}
          </Text>
          <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
            {t('settings.verify_password.description')}
          </Text>

          <View style={styles.inputContainer}>
            <PasswordInput
              label={t('settings.verify_password.label')}
              value={password}
              onChangeText={setPassword}
              onToggleVisibility={() => setIsPasswordVisible(!isPasswordVisible)}
              isVisible={isPasswordVisible}
              showCheck={true}
              status={isPasswordValid ? 'success' : undefined}
            />
          </View>
        </View>
      </View>

      <BottomBar
        leftButton={{
          label: t('settings.common.cancel'),
          onPress: handleCancel,
          enabled: !isLoading,
          visible: true,
          type: 'secondary',
        }}
        rightButton={{
          label: t('settings.common.next'),
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
      textAlign: 'left',
    },
    description: {
      fontSize: theme.typography.sizes.md,
      lineHeight: 20,
      marginBottom: theme.spacing.xl,
      fontFamily: theme.typography.fonts.regular,
      textAlign: 'left',
    },
    inputContainer: {
      marginTop: theme.spacing.md,
    },
  });

export default VerifyPasswordScreen;
