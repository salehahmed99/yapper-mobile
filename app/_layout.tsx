import { QueryProvider } from '@/src/context/QueryProvider';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import i18n, { initLanguage } from '@/src/i18n';
import { useAuthStore } from '@/src/store/useAuthStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

interface IAuthInitializerProps {
  children: React.ReactNode;
}
const AuthInitializer: React.FC<IAuthInitializerProps> = ({ children }) => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { navigate } = useNavigation();
  const [fontsLoaded] = useFonts({
    'PublicSans-ExtraLight': require('../assets/fonts/PublicSans-ExtraLight.ttf'),
    'PublicSans-Light': require('../assets/fonts/PublicSans-Light.ttf'),
    'PublicSans-Regular': require('../assets/fonts/PublicSans-Regular.ttf'),
    'PublicSans-Medium': require('../assets/fonts/PublicSans-Medium.ttf'),
    'PublicSans-SemiBold': require('../assets/fonts/PublicSans-SemiBold.ttf'),
    'PublicSans-Bold': require('../assets/fonts/PublicSans-Bold.ttf'),
    'PublicSans-ExtraBold': require('../assets/fonts/PublicSans-ExtraBold.ttf'),
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });
  useEffect(() => {
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      const tweetId = data.tweet_id as string;
      const userId = data.user_id as string;
      if (tweetId) {
        navigate({ pathname: '/(protected)/tweets/[tweetId]', params: { tweetId: tweetId } });
      }
      if (userId) {
        navigate({ pathname: '/(protected)/(profile)/[id]', params: { id: userId } });
      }
    });
    return () => {
      responseListener.remove();
    };
  }, [navigate]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load the language BEFORE rendering the app
        await initLanguage();
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }
  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryProvider>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider>
            <BottomSheetModalProvider>
              <AuthInitializer>
                <Stack screenOptions={{ headerShown: false }}></Stack>
              </AuthInitializer>
            </BottomSheetModalProvider>
          </ThemeProvider>
          <Toast />
        </I18nextProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
