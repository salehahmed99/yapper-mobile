import ActivityLoader from '@/src/components/ActivityLoader';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import AuthInput from '@/src/modules/auth/components/shared/AuthInput';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { emailSchema } from '@/src/modules/auth/schemas/schemas';
import { changeEmail } from '@/src/modules/settings/services/yourAccountService';
import { useAuthStore } from '@/src/store/useAuthStore';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export const UpdateEmailScreen: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { navigate, goBack } = useNavigation();
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
        text1: t('settings.email.invalid_title'),
        text2: t('settings.email.invalid_error'),
      });
      return;
    }

    setIsLoading(true);
    try {
      await changeEmail(email);
      Toast.show({
        type: 'success',
        text1: t('settings.email.updated'),
        text2: t('settings.email.updated_message'),
      });
      navigate({
        pathname: '/(protected)/(settings)/your-account/account-information/confirm-email-change',
        params: { email },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('settings.email.update_failed'),
        text2: error instanceof Error ? error?.message : t('settings.email.update_failed_message'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    goBack();
  };

  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ActivityLoader visible={isLoading} />
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />
      <TopBar showExitButton={false} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>{t('settings.email.title')}</Text>

          <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
            {t('settings.email.description', { email: currentEmail })}
          </Text>

          <Text style={[styles.warning, { color: theme.colors.text.secondary }]}>
            {t('settings.email.warning')}{' '}
            <Text style={[styles.link, { color: theme.colors.text.link }]}>{t('settings.email.warning_link')}</Text>.
          </Text>

          <View style={styles.inputContainer}>
            <AuthInput
              description=""
              label={t('settings.email.label')}
              value={email}
              onChange={setEmail}
              status={
                email.length > 0 && !isEmailValid ? 'error' : email.length > 0 && isEmailValid ? 'success' : 'none'
              }
              showCheck={email.length > 0 && isEmailValid}
              errorMessage={email.length > 0 && !isEmailValid ? t('settings.email.invalid_error') : ''}
              type="text"
            />
          </View>
        </View>
      </ScrollView>

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
      textAlign: 'left',
    },
    description: {
      fontSize: theme.typography.sizes.md,
      lineHeight: 20,
      marginBottom: theme.spacing.lg,
      fontFamily: theme.typography.fonts.regular,
      paddingLeft: theme.spacing.xl,
      textAlign: 'left',
    },
    warning: {
      fontSize: theme.typography.sizes.md,
      lineHeight: 20,
      marginBottom: theme.spacing.xl,
      fontFamily: theme.typography.fonts.regular,
      paddingLeft: theme.spacing.xl,
      textAlign: 'left',
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
