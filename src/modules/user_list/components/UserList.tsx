import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { IUser } from '@/src/types/user';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useUserList } from '../hooks/useUserList';
import { UserListQuery } from '../types';
import UserListItem from './UserListItem';

type UserListProps = UserListQuery & {
  autoLoad?: boolean;
  onUserPress?: (user: IUser) => void;
  renderAction?: (user: IUser) => React.ReactNode;
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    listContent: {
      paddingTop: theme.spacing.xs,
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
      minHeight: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

const UserList: React.FC<UserListProps> = (props) => {
  const { onUserPress, renderAction, autoLoad = true } = props;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { users, loading, refreshing, error, hasNextPage, refresh, loadMore } = useUserList({ ...props, autoLoad });

  // Show toast when there's an error
  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
        position: 'top',
      });
    }
  }, [error]);

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyState}>
        <Text style={error ? styles.errorText : styles.emptyText}>{error || t('userList.emptyState')}</Text>
        {error && (
          <TouchableOpacity style={styles.retryButton} onPress={refresh} activeOpacity={0.7}>
            <Text style={styles.retryText}>{t('userList.errorRetry')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasNextPage && users.length > 0) return null;

    return (
      <View style={styles.footer}>
        {loading && !refreshing && <ActivityIndicator color={theme.colors.text.link} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <UserListItem user={item} onPress={onUserPress} renderAction={renderAction} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.colors.text.link} />
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReachedThreshold={0.3}
        onEndReached={() => hasNextPage && !loading && !refreshing && loadMore()}
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={21}
      />
    </View>
  );
};
export default UserList;
