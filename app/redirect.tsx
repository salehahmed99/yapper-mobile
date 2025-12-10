import ActivityLoader from '@/src/components/ActivityLoader';
import { useTheme } from '@/src/context/ThemeContext';
import { router, usePathname } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

export default function RedirectScreen() {
  const { theme } = useTheme();
  const pathname = usePathname();
  const hasNavigated = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (pathname === '/redirect' && !hasNavigated.current) {
        router.replace('/(auth)/landing-screen');
      }
    }, 15000); // 15 seconds timeout

    return () => {
      clearTimeout(timeout);
      hasNavigated.current = true;
    };
  }, [pathname]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ActivityLoader visible={true} message="Completing sign in..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
