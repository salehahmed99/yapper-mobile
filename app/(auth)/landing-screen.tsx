import ActivityLoader from '@/src/components/ActivityLoader';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import OAuthButtons from '@/src/modules/auth/components/oAuth/OAuthButtons';
import OAuthHeadLine from '@/src/modules/auth/components/oAuth/OAuthHeadLine';
import OAuthLegalText from '@/src/modules/auth/components/oAuth/OAuthLegalText';
import { githubSignIn, googleSignIn } from '@/src/modules/auth/services/authService';
import { useAuthStore } from '@/src/store/useAuthStore';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

const LandingScreen: React.FC = () => {
  const { theme } = useTheme();
  const loginUser = useAuthStore((state) => state.loginUser);
  const setSkipRedirect = useAuthStore((state) => state.setSkipRedirect);
  const [loading, setLoading] = useState(false);
  const { navigate, replace } = useNavigation();

  const styles = useMemo(() => createStyles(theme), [theme]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completeOauthLogin = async (userData: any) => {
    if (userData.data && 'needsCompletion' in userData.data && userData.data.needsCompletion) {
      navigate({
        pathname: '/(auth)/OAuth/birth-date-screen',
        params: {
          sessionToken: userData.data.sessionToken,
        },
      });
      return;
    } else {
      await loginUser(userData.data.user, userData.data.accessToken, userData.data.refreshToken);
      setSkipRedirect(false);
      replace('/(protected)');
    }
  };

  const onGooglePress = async () => {
    setLoading(true);
    try {
      const userData = await googleSignIn();
      completeOauthLogin(userData);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // console.error('Google login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const onGithubPress = async () => {
    setLoading(true);
    try {
      const userData = await githubSignIn();
      completeOauthLogin(userData);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // console.error('GitHub login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const onCreateAccountPress = () => {
    navigate('/(auth)/sign-up/create-account-screen');
  };

  return (
    <View style={styles.container}>
      <ActivityLoader visible={loading} />
      <OAuthHeadLine />

      <View style={styles.bottom}>
        <OAuthButtons
          onGooglePress={onGooglePress}
          onGithubPress={onGithubPress}
          onCreateAccountPress={onCreateAccountPress}
        />
        <OAuthLegalText theme={theme} onLoginPress={() => navigate('/(auth)/login')} />
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    bottom: { paddingHorizontal: theme.spacing.xxl, paddingBottom: theme.spacing.xxl },
  });

export default LandingScreen;
