import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import useSpacing from '@/src/hooks/useSpacing';
import MessageItem from '@/src/modules/chat/components/MessageItem';
import MessagesEmptyState from '@/src/modules/chat/components/MessagesEmptyState';
import { IChat } from '@/src/modules/chat/types';
import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';

interface MessagesListProps {
  chats: IChat[];
  onChatPress?: (chat: IChat) => void;
  onWriteMessage?: () => void;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  isLoadingMore?: boolean;
  isRefreshing?: boolean;
  hasMore?: boolean;
}

export default function MessagesList({
  chats,
  onChatPress,
  onWriteMessage,
  onLoadMore,
  onRefresh,
  isLoadingMore,
  isRefreshing,
  hasMore,
}: MessagesListProps) {
  const { theme } = useTheme();
  const { bottom } = useSpacing();
  const styles = createStyles(theme);

  // Update every minute to refresh relative times
  const [currentMinute, setCurrentMinute] = useState(() => Math.floor(Date.now() / 60000));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMinute(Math.floor(Date.now() / 60000));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const renderMessage = ({ item }: { item: IChat }) => <MessageItem chat={item} onPress={() => onChatPress?.(item)} />;

  const renderEmptyState = () => <MessagesEmptyState onWriteMessage={onWriteMessage} />;

  const renderSeparator = () => <View style={styles.separator} />;

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.accent.bookmark} />
      </View>
    );
  };

  const handleEndReached = () => {
    if (hasMore && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  };

  return (
    <FlashList
      data={chats}
      renderItem={renderMessage}
      keyExtractor={(item) => item.id}
      extraData={currentMinute}
      contentContainerStyle={[
        styles.listContent,
        { paddingBottom: bottom },
        chats.length === 0 && styles.listContentEmpty,
      ]}
      ItemSeparatorComponent={renderSeparator}
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={renderFooter}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing ?? false}
            onRefresh={onRefresh}
            tintColor={theme.colors.accent.bookmark}
            colors={[theme.colors.accent.bookmark]}
          />
        ) : undefined
      }
      testID="messages_list"
    />
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    listContent: {
      flexGrow: 1,
    },
    listContentEmpty: {
      justifyContent: 'center',
    },
    separator: {
      height: 0,
      backgroundColor: theme.colors.border,
      marginLeft: 48 + theme.spacing.md + theme.spacing.lg,
    },
    footer: {
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
  });
