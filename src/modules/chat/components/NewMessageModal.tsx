import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { FlashList } from '@shopify/flash-list';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Search, X } from 'lucide-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createChat, searchUsers } from '../services/chatService';
import { IUserSearchResult } from '../types';

const USERS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 300;

interface INewMessageModalProps {
  visible: boolean;
  onClose: () => void;
  onChatCreated: (chatId: string, participant: { name: string; username: string; avatarUrl: string | null }) => void;
}

interface IUserItemProps {
  user: IUserSearchResult;
  onPress: (user: IUserSearchResult) => void;
  isCreating: boolean;
}

const UserItem: React.FC<IUserItemProps> = ({ user, onPress, isCreating }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();

  return (
    <Pressable
      style={({ pressed }) => [styles.userItem, pressed && styles.userItemPressed]}
      onPress={() => onPress(user)}
      disabled={isCreating}
      testID={`new_message_user_item_${user.userId}`}
      accessibilityLabel={t('messages.search.startChat', { name: user.name })}
    >
      <Image
        source={user.avatarUrl ? { uri: user.avatarUrl } : require('@assets/images/avatar-placeholder.png')}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {user.name}
          </Text>
          {user.verified && <Text style={styles.verified}>✓</Text>}
        </View>
        <Text style={styles.username} numberOfLines={1}>
          @{user.username}
        </Text>
      </View>
    </Pressable>
  );
};

const NewMessageModal: React.FC<INewMessageModalProps> = ({ visible, onClose, onChatCreated }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [creatingForUserId, setCreatingForUserId] = useState<string | null>(null);

  // Debounce search input
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(text.trim());
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  };

  // Search users query
  const {
    data: searchData,
    isLoading: isSearching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['searchUsers', debouncedQuery],
    queryFn: ({ pageParam }) =>
      searchUsers({
        query: debouncedQuery,
        limit: USERS_PER_PAGE,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.pagination.hasMore ? lastPage.pagination.nextCursor : undefined),
    enabled: debouncedQuery.length > 0,
  });

  // Flatten users from all pages
  const users = useMemo(() => {
    return searchData?.pages.flatMap((page) => page.users) ?? [];
  }, [searchData]);
  const createChatMutation = useMutation({
    mutationFn: createChat,
    onSuccess: (result, variables) => {
      const user = users.find((u) => u.userId === variables.recipientId);
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['chats'] });
        onChatCreated(result.chat.id, {
          name: user.name,
          username: user.username,
          avatarUrl: user.avatarUrl,
        });
      }
      setCreatingForUserId(null);
      handleClose();
    },
    onError: () => {
      setCreatingForUserId(null);
    },
  });

  // Handle user selection
  const handleUserPress = useCallback(
    (user: IUserSearchResult) => {
      setCreatingForUserId(user.userId);
      createChatMutation.mutate({ recipientId: user.userId });
    },
    [createChatMutation],
  );

  // Handle close
  const handleClose = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onClose();
  }, [onClose]);

  // Load more users
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Render user item
  const renderUserItem = useCallback(
    ({ item }: { item: IUserSearchResult }) => (
      <UserItem user={item} onPress={handleUserPress} isCreating={creatingForUserId === item.userId} />
    ),
    [handleUserPress, creatingForUserId],
  );

  // Render empty state
  const renderEmptyState = () => {
    if (isSearching) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={theme.colors.accent.bookmark} />
        </View>
      );
    }

    if (debouncedQuery.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>{t('messages.search.searchPrompt')}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>{t('messages.search.noResults', { query: debouncedQuery })}</Text>
      </View>
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.accent.bookmark} />
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View style={[styles.container, { paddingTop: insets.top }]} testID="new_message_modal_container">
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={handleClose}
            style={styles.backButton}
            hitSlop={8}
            testID="new_message_back_button"
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <ArrowLeft size={24} color={theme.colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle} testID="new_message_header_title">
            {t('messages.newMessage')}
          </Text>
          <View style={styles.headerRight} />
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Search size={20} color={theme.colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('messages.search.placeholder')}
            placeholderTextColor={theme.colors.text.secondary}
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            autoFocus
            testID="new_message_search_input"
            accessibilityLabel={t('messages.search.placeholder')}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={handleClearSearch} style={styles.clearButton} hitSlop={8}>
              <X size={18} color={theme.colors.text.secondary} />
            </Pressable>
          )}
        </View>

        <View style={styles.listContainer}>
          <FlashList<IUserSearchResult>
            data={users}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.userId}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={renderEmptyState}
            ListFooterComponent={renderFooter}
          />
        </View>

        {/* Loading overlay when creating chat */}
        {creatingForUserId && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.accent.bookmark} />
            <Text style={styles.loadingText}>{t('messages.creatingChat')}</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: theme.typography.sizes.lg,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
    },
    headerRight: {
      width: 40,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.secondary,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: theme.spacing.md,
    },
    searchIcon: {
      marginRight: theme.spacing.sm,
    },
    searchInput: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.primary,
    },
    clearButton: {
      padding: theme.spacing.xs,
    },
    listContainer: {
      flex: 1,
    },
    userItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    userItemPressed: {
      backgroundColor: theme.colors.background.secondary,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.background.secondary,
    },
    userInfo: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    name: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.semiBold,
      color: theme.colors.text.primary,
    },
    verified: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.accent.bookmark,
      marginLeft: theme.spacing.xs,
    },
    username: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    emptyStateText: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.secondary,
    },
    footer: {
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.primary,
      marginTop: theme.spacing.md,
    },
  });

export default NewMessageModal;
