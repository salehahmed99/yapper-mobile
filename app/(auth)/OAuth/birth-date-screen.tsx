import { View, StyleSheet } from 'react-native';
import React, { useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import AuthInput from '@/src/modules/auth/components/shared/AuthInput';
import { useTheme } from '@/src/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/src/constants/theme';
import { useTranslation } from 'react-i18next';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import { OAuthStep1, OAuthStep2 } from '@/src/modules/auth/services/authService';
import Toast from 'react-native-toast-message';
import ActivityLoader from '@/src/components/ActivityLoader';
import { useAuthStore } from '@/src/store/useAuthStore';

const BirthDateScreen = () => {
  const [birthDate, setBirthDate] = useState('');
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { sessionToken: _sessionToken } = useLocalSearchParams();

  const loginUser = useAuthStore((state) => state.loginUser);
  const setSkipRedirect = useAuthStore((state) => state.setSkipRedirect);

  const onNextPress = async () => {
    setLoading(true);
    try {
      setSkipRedirect(true);
      const res = await OAuthStep1({
        oauth_session_token: _sessionToken as string,
        birth_date: birthDate,
      });

      const secResponse = await OAuthStep2({
        oauth_session_token: _sessionToken as string,
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
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar without exit button */}
      <ActivityLoader visible={loading} />
      <TopBar showExitButton={false} />

      <View style={styles.content}>
        <AuthInput
          title={t('auth.birthDate.title')}
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
          enabled: birthDate.length > 0,
          visible: true,
          type: 'primary',
        }}
      />
    </SafeAreaView>
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
      padding: theme.spacing.lg,
      justifyContent: 'center',
    },
  });

export default BirthDateScreen;
