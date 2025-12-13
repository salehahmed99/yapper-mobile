import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import useSpacing from '@/src/hooks/useSpacing';
import { useAuthStore } from '@/src/store/useAuthStore';
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
  const { bottom } = useSpacing();
  const currentUser = useAuthStore((state) => state.user);

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
    if (error) {
      return (
        <View style={styles.emptyState} testID="user_list_error_state">
          <Text style={styles.errorText} testID="user_list_error_text">
            {error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refresh}
            activeOpacity={0.7}
            testID="user_list_retry_button"
            accessibilityLabel="retry_loading_users"
          >
            <Text style={styles.retryText}>{t('userList.errorRetry')}</Text>
          </TouchableOpacity>
        </View>
      );
    }
    // Show empty state when no users
    return (
      <View style={styles.emptyState} testID="user_list_empty_state">
        <Text style={styles.emptyText} testID="user_list_empty_text">
          {t('userList.emptyState')}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    return (
      <View style={[styles.footer, { paddingBottom: bottom }]} testID="user_list_footer">
        {loading && !refreshing && hasNextPage && (
          <ActivityIndicator color={theme.colors.text.link} testID="user_list_loader" />
        )}
      </View>
    );
  };

  // Don't render action if the user is the current logged-in user
  const getActionRenderer = (user: IUser) => {
    if (!renderAction) return undefined;
    if (currentUser?.id === user.id) return undefined;
    return renderAction(user);
  };

  return (
    <View style={styles.container} testID="user_list_container">
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserListItem user={item} onPress={onUserPress} renderAction={() => getActionRenderer(item)} />
        )}
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
        testID="user_list_flatlist"
      />
    </View>
  );
};
export default UserList;
