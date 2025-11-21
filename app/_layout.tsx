import { QueryProvider } from '@/src/context/QueryProvider';
import { ThemeProvider } from '@/src/context/ThemeContext';
import i18n from '@/src/i18n';
import { useAuthStore } from '@/src/store/useAuthStore';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
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

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'PublicSans-ExtraLight': require('../assets/fonts/PublicSans-ExtraLight.ttf'),
    'PublicSans-Light': require('../assets/fonts/PublicSans-Light.ttf'),
    'PublicSans-Regular': require('../assets/fonts/PublicSans-Regular.ttf'),
    'PublicSans-Medium': require('../assets/fonts/PublicSans-Medium.ttf'),
    'PublicSans-SemiBold': require('../assets/fonts/PublicSans-SemiBold.ttf'),
    'PublicSans-Bold': require('../assets/fonts/PublicSans-Bold.ttf'),
    'PublicSans-ExtraBold': require('../assets/fonts/PublicSans-ExtraBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
