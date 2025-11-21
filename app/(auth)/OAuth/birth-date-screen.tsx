import { View, StyleSheet } from 'react-native';
import React, { useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import AuthInput from '@/src/modules/auth/components/shared/AuthInput';
import { useTheme } from '@/src/context/ThemeContext';
import { Theme } from '@/src/constants/theme';
import { useTranslation } from 'react-i18next';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import { OAuthStep1, OAuthStep2 } from '@/src/modules/auth/services/authService';
import Toast from 'react-native-toast-message';
import ActivityLoader from '@/src/components/ActivityLoader';
import { useAuthStore } from '@/src/store/useAuthStore';
import { userBirthDateSchema } from '@/src/modules/auth/schemas/schemas';
import AuthTitle from '@/src/modules/auth/components/shared/Title';

const BirthDateScreen = () => {
  const [birthDate, setBirthDate] = useState('');
  const [isNextEnabled, setIsNextEnabled] = useState(true);
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { sessionToken: _sessionToken } = useLocalSearchParams();

  const loginUser = useAuthStore((state) => state.loginUser);
  const setSkipRedirect = useAuthStore((state) => state.setSkipRedirect);

  const onNextPress = async () => {
    setLoading(true);
    setIsNextEnabled(false);
    if (!userBirthDateSchema.safeParse(birthDate).success) {
      Toast.show({
        type: 'error',
        text1: t('auth.birthDate.errorToast'),
        text2: t('auth.birthDate.errorDescriptionToast'),
      });
      setLoading(false);
      setIsNextEnabled(true);
      return;
    }
    try {
      setSkipRedirect(true);
      const res = await OAuthStep1({
        oauthSessionToken: _sessionToken as string,
        birthDate: birthDate,
      });

      const secResponse = await OAuthStep2({
        oauthSessionToken: _sessionToken as string,
        username: res.data.usernames[0],
      });

      await loginUser(secResponse.data.user, secResponse.data.accessToken);

      Toast.show({
        type: 'success',
        text1: t('auth.birthDate.successToast'),
      });

      router.replace({
        pathname: '/(auth)/OAuth/user-name-screen',
        params: {
          sessionToken: _sessionToken,
          userNames: JSON.stringify(res.data.usernames),
        },
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('auth.birthDate.errorToast'),
        text2: (error as Error).message,
      });
    } finally {
      setLoading(false);
      setIsNextEnabled(true);
    }
  };

  return (
    <View style={styles.container}>
      <ActivityLoader visible={loading} />
      <TopBar showExitButton={false} />

      <View style={styles.content}>
        <AuthTitle title={t('auth.birthDate.title')} />

        <AuthInput
          description={t('auth.birthDate.description')}
          label={t('auth.birthDate.label')}
          value={birthDate}
          onChange={setBirthDate}
          type="date"
        />
      </View>

      <BottomBar
        rightButton={{
          label: t('auth.birthDate.buttons.signUp'),
          onPress: onNextPress,
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
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      flex: 1,
      justifyContent: 'flex-start',
      paddingHorizontal: theme.spacing.xl,
    },
    title: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.xml,
      fontFamily: theme.typography.fonts.bold,
      lineHeight: 36,
      marginBottom: theme.spacing.mdg,
      letterSpacing: -0.3,
      paddingHorizontal: theme.spacing.xl,
    },
  });

export default BirthDateScreen;
