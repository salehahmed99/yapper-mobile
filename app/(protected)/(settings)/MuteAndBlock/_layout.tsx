import { useTheme } from '@/src/context/ThemeContext';
import MuteAndBlockHeader from '@/src/modules/settings/components/MuteAndBlockHeader';
import { useAuthStore } from '@/src/store/useAuthStore';
import { Stack } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function MuteAndBlockLayout() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const username = user?.username || '';

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
      headerShadowVisible: false,
      headerBackTitleVisible: false,
    }),
    [theme],
  );

  const muteAndBlockOptions = React.useMemo(
    () => ({
      headerShown: true,
      headerBackVisible: true,
      headerBackTitle: '',
      headerTitle: () => <MuteAndBlockHeader username={username} title={t('settings.mute_block.title')} />,
      headerTitleAlign: 'center' as const,
    }),
    [username, t],
  );

  const mutedAccountsOptions = React.useMemo(
    () => ({
      headerShown: true,
      headerBackVisible: true,
      headerBackTitle: '',
      headerBackTitleVisible: false,
      headerTitle: () => <MuteAndBlockHeader username={username} title={t('settings.mute_block.muted_accounts')} />,
      headerTitleAlign: 'center' as const,
    }),
    [username, t],
  );

  const blockedAccountsOptions = React.useMemo(
    () => ({
      headerShown: true,
      headerBackVisible: true,
      headerBackTitle: '',
      headerBackTitleVisible: false,
      headerTitle: () => <MuteAndBlockHeader username={username} title={t('settings.mute_block.blocked_accounts')} />,
      headerTitleAlign: 'center' as const,
    }),
    [username, t],
  );

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="MuteAndBlockScreen" options={muteAndBlockOptions} />
      <Stack.Screen name="Muted" options={mutedAccountsOptions} />
      <Stack.Screen name="Blocked" options={blockedAccountsOptions} />
    </Stack>
  );
}
