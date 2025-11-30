import BlockButton from '@/src/modules/user_list/components/BlockButton';
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

export default function BlockedAccountsContainer() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const mutedStyles = useMemo(() => createMutedAccountsStyles(theme), [theme]);
  const { users, loading, error } = useUserList({ type: 'blocked', autoLoad: true });

  const handleUserPress = (user: IUser) => {
    router.push(`/(profile)/${user.id}` as any);
  };

  const handleBlockPress = (_user: IUser) => {
    // Handled inside BlockButton
  };

  // Show header/description only if list is empty and not loading/error
  const showEmptyHeader = !loading && !error && users.length === 0;

  return (
    <View style={styles.container}>
      {showEmptyHeader ? (
        <View style={mutedStyles.header}>
          <Text style={mutedStyles.title}>Block unwanted accounts</Text>
          <Text style={mutedStyles.description}>
            They will be able to see your public posts, but will no longer be able to engage with them. They will also
            not be able to follow or message you, and you will not see notifications from them.
          </Text>
        </View>
      ) : null}
      <UserList
        type="blocked"
        onUserPress={handleUserPress}
        renderAction={(user) => <BlockButton user={user} onPress={handleBlockPress} />}
      />
    </View>
  );
}
