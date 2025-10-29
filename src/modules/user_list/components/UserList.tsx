import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUserList } from '../hooks/useUserList';
import { IUserListUser, UserListType } from '../types';
import UserListItem from './UserListItem';

interface UserListProps {
  tweetId: string;
  type: UserListType;
  title?: string;
  onBackPress?: () => void;
  onUserPress?: (user: IUserListUser) => void;
  renderRightAction?: (user: IUserListUser) => React.ReactNode;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      borderBottomColor: theme.colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backButton: {
      marginRight: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
    },
    backText: {
      color: theme.colors.text.link,
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.medium,
    },
    title: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.lg,
      fontFamily: theme.typography.fonts.semiBold,
    },
    listContent: {
      paddingBottom: theme.spacing.xxl,
    },
    emptyState: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xxl,
      alignItems: 'center',
    },
    emptyText: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.md,
      textAlign: 'center',
    },
    errorText: {
      color: theme.colors.error,
      fontSize: theme.typography.sizes.md,
      textAlign: 'center',
    },
    retryButton: {
      marginTop: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.text.link,
    },
    retryText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.medium,
    },
    footer: {
      paddingVertical: theme.spacing.lg,
    },
  });

const getDefaultTitle = (type: UserListType) => {
  if (type === 'likers') {
    return 'Liked by';
  }
  return 'Retweeted by';
};

const UserList: React.FC<UserListProps> = ({ tweetId, type, title, onBackPress, onUserPress, renderRightAction }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { users, loading, refreshing, error, hasNextPage, refresh, loadMore } = useUserList({ tweetId, type });

  const handleRetry = () => {
    refresh();
  };

  const renderEmpty = () => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyState}>
        <Text style={error ? styles.errorText : styles.emptyText}>{error ? error : 'Nobody yet.'}</Text>
        {error ? (
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry} activeOpacity={0.7}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading || refreshing) {
      return null;
    }
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={theme.colors.text.link} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {onBackPress ? (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton} activeOpacity={0.7}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        ) : null}
        <Text style={styles.title}>{title ?? getDefaultTitle(type)}</Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserListItem user={item} onPress={onUserPress} rightAction={renderRightAction?.(item)} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.colors.text.link} />
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !loading) {
            loadMore();
          }
        }}
      />
    </View>
  );
};

export default UserList;
