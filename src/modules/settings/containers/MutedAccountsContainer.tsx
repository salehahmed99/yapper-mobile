import MuteButton from '@/src/modules/user_list/components/MuteButton';
import UserList from '@/src/modules/user_list/components/UserList';
import { useUserList } from '@/src/modules/user_list/hooks/useUserList';
import { IUser } from '@/src/types/user';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Theme } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';
import { createMutedAccountsStyles } from '../styles/muted-and-blocked-accounts-styles';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
  });

export default function MutedAccountsContainer() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const mutedStyles = useMemo(() => createMutedAccountsStyles(theme), [theme]);
  const { users, loading, error } = useUserList({ type: 'muted', autoLoad: true });

  const handleUserPress = (user: IUser) => {
    router.push(`/(profile)/${user.id}` as any);
  };

  const handleMutePress = (_user: IUser) => {
    // Handled inside MuteButton
  };

  // Show header/description only if list is empty and not loading/error
  const showEmptyHeader = !loading && !error && users.length === 0;

  return (
    <View style={styles.container}>
      {showEmptyHeader ? (
        <View style={mutedStyles.header}>
          <Text style={mutedStyles.title}>Muted accounts</Text>
          <Text style={mutedStyles.description}>
            Posts from muted accounts won&apos;t show up in your Home timeline. Mute accounts directly from their
            profile or posts.
          </Text>
        </View>
      ) : null}
      <UserList
        type="muted"
        onUserPress={handleUserPress}
        renderAction={(user) => <MuteButton user={user} onPress={handleMutePress} />}
      />
    </View>
  );
}
