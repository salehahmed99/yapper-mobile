import { useTheme } from '@/src/context/ThemeContext';
import { Stack } from 'expo-router';
import React from 'react';

export default function TweetActivityLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: theme.colors.background.primary,
        },
        headerTintColor: theme.colors.text.primary,
        headerShadowVisible: false,
      }}
    />
  );
}
