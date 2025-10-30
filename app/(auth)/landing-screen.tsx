import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/src/store/useAuthStore';
import { googleSignIn, githubSignIn } from '@/src/modules/auth/services/authService';
import { useTheme } from '@/src/context/ThemeContext';
import OAuthHeadLine from '@/src/modules/auth/components/oAuth/OAuthHeadLine';
import OAuthButtons from '@/src/modules/auth/components/oAuth/OAuthButtons';
import OAuthLegalText from '@/src/modules/auth/components/oAuth/OAuthLegalText';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActivityLoader from '@/src/components/ActivityLoader';
import { Theme } from '@/src/constants/theme';

const LandingScreen: React.FC = () => {
  const { theme } = useTheme();
  const loginUser = useAuthStore((state) => state.loginUser);
  const [loading, setLoading] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const onGooglePress = async () => {
    setLoading(true);
    try {
      const userData = await googleSignIn();
      loginUser(userData.data.user, userData.data.accessToken);
    } catch (error) {
      console.error('Google login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const onGithubPress = async () => {
    setLoading(true);
    try {
      const userData = await githubSignIn();
      loginUser(userData.data.user, userData.data.accessToken);
    } catch (error) {
      console.error('GitHub login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ActivityLoader visible={loading} />
      <OAuthHeadLine theme={theme} />

      <View style={styles.bottom}>
        <OAuthButtons theme={theme} onGooglePress={onGooglePress} onGithubPress={onGithubPress} />
        <OAuthLegalText theme={theme} onLoginPress={() => router.push('/(auth)/login')} />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1 },
    bottom: { paddingHorizontal: theme.spacing.xxl, paddingBottom: theme.spacing.xxl },
  });

export default LandingScreen;
