import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import ChatBubble from '@/src/modules/chat/components/ChatBubble';
import TypingIndicator from '@/src/modules/chat/components/TypingIndicator';
import { IChatMessageItem, IChatMessageSender, IReplyContext } from '@/src/modules/chat/types';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import React, { useCallback, useMemo, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface ChatMessagesListProps {
  messages: IChatMessageItem[];
  currentUserId?: string;
  sender?: IChatMessageSender | null;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  isOtherUserTyping?: boolean;
  onReplyToMessage?: (message: IChatMessageItem, senderName: string) => void;
  onReactToMessage?: (messageId: string, emoji: string) => void;
  onRemoveReactToMessage?: (messageId: string, emoji: string) => void;
  replyingTo?: IReplyContext | null;
  onRequestEmojiPicker?: (messageId: string) => void;
}

export default function ChatMessagesList({
  messages,
  currentUserId,
  sender,
  onLoadMore,
  isLoadingMore,
  hasMore,
  isOtherUserTyping,
  onReplyToMessage,
  onReactToMessage,
  onRemoveReactToMessage,
  replyingTo,
  onRequestEmojiPicker,
}: ChatMessagesListProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const flashListRef = useRef<FlashListRef<IChatMessageItem> | null>(null);

  // Create a map of message IDs to messages for O(1) lookup of replied messages
  const messagesMap = useMemo(() => {
    const map = new Map<string, IChatMessageItem>();
    messages.forEach((msg) => map.set(msg.id, msg));
    return map;
  }, [messages]);
  const lastMessageIdRef = useRef<string | null>(null);
  React.useEffect(() => {
    if (messages.length === 0) return;
    const currentLastMessageId = messages[messages.length - 1]?.id;
    const prevLastMessageId = lastMessageIdRef.current;
    if (currentLastMessageId && currentLastMessageId !== prevLastMessageId && prevLastMessageId !== null) {
      setTimeout(() => {
        flashListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    lastMessageIdRef.current = currentLastMessageId;
  }, [messages]);
  React.useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flashListRef.current?.scrollToEnd({ animated: false });
      }, 200);
    }
  }, [messages.length]);
  React.useEffect(() => {
    if (isOtherUserTyping) {
      setTimeout(() => {
        flashListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isOtherUserTyping]);
  React.useEffect(() => {
    if (replyingTo) {
      setTimeout(() => {
        flashListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [replyingTo]);

  const renderMessage = useCallback(
    ({ item, onOpenEmojiPicker }: { item: IChatMessageItem; onOpenEmojiPicker?: () => void }) => {
      let isOwn: boolean;
      if (item.senderId) {
        isOwn = item.senderId === currentUserId;
      } else {
        isOwn = false;
      }
      const cachedReplyMessage = item.replyTo ? messagesMap.get(item.replyTo) : null;
      const replyMessage =
        cachedReplyMessage ||
        (item.replyToMessage
          ? ({
              id: item.replyToMessage.id,
              content: item.replyToMessage.content,
              senderId: item.replyToMessage.senderId,
            } as IChatMessageItem)
          : null);

      const getReplyMessageSenderName = () => {
        if (!replyMessage) return undefined;
        const replyIsOwn = replyMessage.senderId ? replyMessage.senderId === currentUserId : false;
        return replyIsOwn ? 'You' : sender?.name || sender?.username || 'Unknown';
      };
      const getSenderName = () => {
        return isOwn ? 'You' : sender?.name || sender?.username || 'Unknown';
      };

      return (
        <ChatBubble
          message={item}
          isOwn={isOwn}
          replyMessage={replyMessage}
          replyMessageSenderName={getReplyMessageSenderName()}
          onReply={() => onReplyToMessage?.(item, getSenderName())}
          onReact={onReactToMessage}
          onRemoveReact={onRemoveReactToMessage}
          onOpenEmojiPicker={onOpenEmojiPicker}
        />
      );
    },
    [currentUserId, messagesMap, sender, onReplyToMessage, onReactToMessage, onRemoveReactToMessage],
  );

  const renderHeader = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingHeader}>
        <ActivityIndicator size="small" color={theme.colors.accent.bookmark} />
      </View>
    );
  };

  const renderFooter = () => {
    if (!isOtherUserTyping) return null;
    return <TypingIndicator />;
  };

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  return (
    <FlashList
      ref={flashListRef}
      data={messages}
      renderItem={(props) =>
        renderMessage({
          ...props,
          onOpenEmojiPicker: () => {
            onRequestEmojiPicker?.(props.item.id);
          },
        } as any)
      }
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      onStartReached={handleLoadMore}
      onStartReachedThreshold={0.5}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      extraData={messagesMap}
      testID="chat_messages_list"
    />
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    listContent: {
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
    },
    loadingHeader: {
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
  });
