import { useTheme } from '@/src/context/ThemeContext';
import { Stack } from 'expo-router';
import React from 'react';

export default function SearchLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background.primary,
        },
        animation: 'slide_from_right',
        animationDuration: 20,
      }}
    >
      <Stack.Screen name="search-suggestions" />
      <Stack.Screen name="search-results" />
    </Stack>
  );
}
