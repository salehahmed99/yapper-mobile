import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import { useAuthStore } from '@/src/store/useAuthStore';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  backButton: {
    marginLeft: 6,
  },
});

export default function ProfileLayout() {
  const { theme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const { goBack } = useNavigation();
  const params = useLocalSearchParams<{ username?: string }>();
  const username = Array.isArray(params.username) ? params.username[0] : params.username;
  const listsUsername = username || user?.name || 'User';

  const screenOptions = React.useMemo(
    () => ({
      contentStyle: {
        backgroundColor: theme.colors.background.primary,
      },
      headerStyle: {
        backgroundColor: theme.colors.background.primary,
      },
      headerTintColor: theme.colors.text.primary,
      headerTitleStyle: {
        color: theme.colors.text.primary,
        fontWeight: '700' as const,
        fontSize: 18,
      },
    }),
    [theme],
  );

  const listsOptions = React.useMemo(
    () => ({
      headerShown: true,
      headerBackTitle: '',
      title: listsUsername,
      headerShadowVisible: false,
      headerLeft: () => (
        <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
          <ChevronLeft color={theme.colors.text.primary} size={24} />
        </TouchableOpacity>
      ),
    }),
    [listsUsername, theme, goBack],
  );

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="Profile"
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
      <Stack.Screen name="Lists" options={listsOptions} />
    </Stack>
  );
}
