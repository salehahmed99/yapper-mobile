import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import useSpacing from '@/src/hooks/useSpacing';
import ChatHeader from '@/src/modules/chat/components/ChatHeader';
import ChatInput from '@/src/modules/chat/components/ChatInput';
import ChatMessagesList from '@/src/modules/chat/components/ChatMessagesList';
import { useChatConversation } from '@/src/modules/chat/hooks/useChatConversation';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ChatConversationPage() {
  const params = useLocalSearchParams<{ id: string; name?: string; username?: string; avatarUrl?: string }>();
  const { id: chatId } = params;
  const router = useRouter();
  const { theme } = useTheme();
  const { top, bottom } = useSpacing();
  const headerPadding = top - theme.ui.appBarHeight - theme.ui.tabViewHeight;
  const styles = createStyles(theme);
  const userName = params.name || 'Unknown User';
  const userUsername = params.username || 'unknown';
  const hasTypedThisSession = useRef<boolean>(false);
  const wasKeyboardVisible = useRef<boolean>(false);

  const {
    messages,
    sender,
    currentUserId,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    inputText,
    isOtherUserTyping,
    isKeyboardVisible,
    keyboardHeight,
    replyingTo,
    handleTextChange,
    handleSend,
    handleLoadMore,
    handleReplyToMessage,
    handleCancelReply,
  } = useChatConversation({ chatId: chatId as string });

  const inputLengthOnKeyboardOpen = useRef<number>(0);

  if (!wasKeyboardVisible.current && isKeyboardVisible) {
    inputLengthOnKeyboardOpen.current = inputText.length;
    hasTypedThisSession.current = false;
  }
  if (wasKeyboardVisible.current && !isKeyboardVisible) {
    hasTypedThisSession.current = false;
  }
  wasKeyboardVisible.current = isKeyboardVisible;
  if (isKeyboardVisible && inputText.length !== inputLengthOnKeyboardOpen.current && !hasTypedThisSession.current) {
    hasTypedThisSession.current = true;
  }

  const inputPadding =
    Platform.OS === 'ios'
      ? isKeyboardVisible
        ? 0
        : bottom
      : isKeyboardVisible
        ? hasTypedThisSession.current
          ? keyboardHeight
          : bottom + theme.spacing.xxl
        : bottom;

  const handleBack = () => {
    router.back();
  };

  // For testing: clear and refetch the messages cache
  const queryClient = useQueryClient();
  const handleClearCache = () => {
    queryClient.resetQueries({ queryKey: ['messages', chatId] });
    Alert.alert('Cache Cleared', 'Messages cache has been reset and refetching...');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: headerPadding }]}>
        <ChatHeader
          name={userName}
          username={userUsername}
          avatarUrl={params.avatarUrl}
          onBack={handleBack}
          onInfo={handleClearCache}
        />
      </View>
      <View style={styles.messagesContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.accent.bookmark} />
          </View>
        ) : isError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load messages</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => queryClient.invalidateQueries({ queryKey: ['messages', chatId] })}
            >
              <Text style={styles.retryButtonText}>Tap to Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ChatMessagesList
            messages={messages}
            currentUserId={currentUserId}
            sender={sender}
            onLoadMore={handleLoadMore}
            isLoadingMore={isFetchingNextPage}
            hasMore={hasNextPage}
            isOtherUserTyping={isOtherUserTyping}
            onReplyToMessage={handleReplyToMessage}
            replyingTo={replyingTo}
          />
        )}
      </View>
      <ChatInput
        value={inputText}
        onChangeText={handleTextChange}
        onSend={handleSend}
        style={{ paddingBottom: inputPadding }}
        replyingTo={replyingTo}
        onCancelReply={handleCancelReply}
      />
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    header: {
      backgroundColor: theme.colors.background.primary,
    },
    messagesContainer: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.md,
    },
    retryButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.accent.bookmark,
      borderRadius: theme.borderRadius.md,
    },
    retryButtonText: {
      color: theme.colors.background.primary,
      fontSize: theme.typography.sizes.sm,
      fontWeight: '600',
    },
  });
