import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import useSpacing from '@/src/hooks/useSpacing';
import ChatHeader from '@/src/modules/chat/components/ChatHeader';
import ChatInput from '@/src/modules/chat/components/ChatInput';
import ChatMessagesList from '@/src/modules/chat/components/ChatMessagesList';
import EmojiPickerSheet from '@/src/modules/chat/components/EmojiPickerSheet';
import { useChatConversation } from '@/src/modules/chat/hooks/useChatConversation';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const userName = params.name || t('messages.bubble.unknown');
  const userUsername = params.username || 'unknown';
  const hasTypedThisSession = useRef<boolean>(false);
  const wasKeyboardVisible = useRef<boolean>(false);
  const [pickingEmojiMessageId, setPickingEmojiMessageId] = useState<string | null>(null);

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
    handleReactToMessage,
    handleRemoveReactToMessage,
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

  const handleProfilePress = () => {
    if (sender?.id) {
      router.push({
        pathname: '/(protected)/(profile)/[id]',
        params: { id: sender.id },
      });
    }
  };

  // For testing: clear and refetch the messages cache
  const queryClient = useQueryClient();
  const handleClearCache = () => {
    queryClient.resetQueries({ queryKey: ['messages', chatId] });
    Alert.alert('Cache Cleared', 'Messages cache has been reset and refetching...');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      testID="chat_conversation_container"
    >
      <View style={[styles.header, { paddingTop: headerPadding }]}>
        <ChatHeader
          name={userName}
          username={userUsername}
          avatarUrl={params.avatarUrl}
          onBack={handleBack}
          onInfo={handleClearCache}
          onProfilePress={handleProfilePress}
        />
      </View>
      <View style={styles.messagesContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer} testID="chat_loading_indicator">
            <ActivityIndicator
              size="large"
              color={theme.colors.accent.bookmark}
              accessibilityLabel="Loading messages"
            />
          </View>
        ) : isError ? (
          <View style={styles.errorContainer} testID="chat_error_container">
            <Text style={styles.errorText} testID="chat_error_text">
              {t('messages.failedToLoad')}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => queryClient.invalidateQueries({ queryKey: ['messages', chatId] })}
              testID="chat_retry_button"
              accessibilityLabel={t('messages.accessibility.retryLoading')}
              accessibilityRole="button"
            >
              <Text style={styles.retryButtonText}>{t('messages.tapToRetry')}</Text>
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
            onReactToMessage={handleReactToMessage}
            onRemoveReactToMessage={handleRemoveReactToMessage}
            replyingTo={replyingTo}
            onRequestEmojiPicker={setPickingEmojiMessageId}
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
      {pickingEmojiMessageId && (
        <EmojiPickerSheet
          onSelect={(emoji) => {
            handleReactToMessage(pickingEmojiMessageId, emoji);
            setPickingEmojiMessageId(null);
          }}
          onClose={() => setPickingEmojiMessageId(null)}
        />
      )}
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
