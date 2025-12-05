import { useAuthStore } from '@/src/store/useAuthStore';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import { getMessages } from '../services/chatService';
import { chatSocketService, IMessageSentData, INewMessageData, IUserTypingData } from '../services/chatSocketService';
import { IChatMessageItem, IChatMessageSender, IReplyContext } from '../types';

const MESSAGES_PER_PAGE = 50;

interface UseChatConversationOptions {
  chatId: string;
}

interface UseChatConversationReturn {
  // Data
  messages: IChatMessageItem[];
  sender: IChatMessageSender | null;
  currentUserId: string | undefined;

  // Loading states
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;

  // Typing state
  inputText: string;
  isOtherUserTyping: boolean;
  isKeyboardVisible: boolean;
  keyboardHeight: number;

  // Reply state
  replyingTo: IReplyContext | null;

  // Actions
  handleTextChange: (text: string) => void;
  handleSend: () => void;
  handleLoadMore: () => void;
  handleReplyToMessage: (message: IChatMessageItem, senderName: string) => void;
  handleCancelReply: () => void;
}

export function useChatConversation({ chatId }: UseChatConversationOptions): UseChatConversationReturn {
  const [inputText, setInputText] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<IReplyContext | null>(null);

  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  // Fetch messages with pagination
  const {
    data: messagesData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['messages', chatId],
    queryFn: ({ pageParam }) => getMessages({ chatId, limit: MESSAGES_PER_PAGE, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.pagination.hasMore ? lastPage.pagination.nextCursor : undefined),
    enabled: !!chatId,
  });

  // Flatten messages from all pages and get sender info
  const { messages, sender } = useMemo(() => {
    if (!messagesData?.pages.length) {
      return { messages: [], sender: null };
    }
    const senderInfo = messagesData.pages[0]?.sender || null;
    const reversedPages = [...messagesData.pages].reverse();
    const allMessages = reversedPages.flatMap((page) => page.messages);
    return { messages: allMessages, sender: senderInfo };
  }, [messagesData]);
  // Join chat room on mount, leave on unmount
  useEffect(() => {
    if (!chatId) return;

    chatSocketService.joinChat(chatId);

    return () => {
      chatSocketService.leaveChat(chatId);
    };
  }, [chatId]);

  // Handle new incoming messages
  const handleNewMessage = useCallback(
    (data: INewMessageData) => {
      if (data.chat_id !== chatId) return;
      const messageSenderId = data.message.sender?.id;
      const isSender = messageSenderId === currentUser?.id;
      if (isSender) {
        return;
      }
      const replyToData = data.message.reply_to as { id: string; content: string; sender_id: string } | null;
      const replyToMessage = replyToData
        ? {
            id: replyToData.id,
            content: replyToData.content,
            senderId: replyToData.sender_id,
          }
        : null;
      const newMessage: IChatMessageItem = {
        id: data.message.id,
        content: data.message.content,
        messageType: data.message.message_type,
        replyTo: data.message.reply_to_message_id || null,
        replyToMessage,
        isRead: data.message.is_read,
        createdAt: data.message.created_at,
        updatedAt: data.message.updated_at || data.message.created_at,
        senderId: data.message.sender?.id,
      };

      // Add the new message to the cache (check for duplicates first)
      queryClient.setQueryData(['messages', chatId], (oldData: typeof messagesData) => {
        if (!oldData?.pages?.length) return oldData;

        // Check if message already exists to prevent duplicates
        const allMessages = oldData.pages.flatMap((page) => page.messages);
        if (allMessages.some((msg) => msg.id === newMessage.id)) {
          return oldData;
        }

        // Add message to the first page (newest messages - pages are in reverse chronological order)
        const newPages = [...oldData.pages];
        newPages[0] = {
          ...newPages[0],
          messages: [...newPages[0].messages, newMessage],
        };

        return {
          ...oldData,
          pages: newPages,
        };
      });

      // Also invalidate chats list to update last message
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    [chatId, queryClient, messagesData, currentUser?.id],
  );

  // Handle message sent confirmation
  const handleMessageSent = useCallback(
    (data: IMessageSentData) => {
      const replyToData = data.reply_to as { id: string; content: string; sender_id: string } | null;
      const replyToMessage = replyToData
        ? {
            id: replyToData.id,
            content: replyToData.content,
            senderId: replyToData.sender_id,
          }
        : null;

      const newMessage: IChatMessageItem = {
        id: data.id,
        content: data.content,
        messageType: (data.message_type || 'text') as IChatMessageItem['messageType'],
        replyTo: data.reply_to_message_id || null,
        replyToMessage,
        isRead: data.is_read,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at,
        senderId: data.sender_id, // This is our user's ID
      };

      // Add the sent message to the cache (check for duplicates first)
      queryClient.setQueryData(['messages', chatId], (oldData: typeof messagesData) => {
        if (!oldData?.pages?.length) return oldData;

        // Check if message already exists to prevent duplicates
        const allMessages = oldData.pages.flatMap((page) => page.messages);
        if (allMessages.some((msg) => msg.id === newMessage.id)) {
          return oldData;
        }

        // Add message to the first page (newest messages - pages are in reverse chronological order)
        const newPages = [...oldData.pages];
        newPages[0] = {
          ...newPages[0],
          messages: [...newPages[0].messages, newMessage],
        };

        return {
          ...oldData,
          pages: newPages,
        };
      });

      // Also invalidate chats list to update last message
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    [chatId, queryClient, messagesData],
  );

  // Handle typing indicators
  const handleUserTyping = useCallback(
    (data: IUserTypingData) => {
      if (data.chat_id === chatId && data.user_id !== currentUser?.id) {
        setOtherUserTyping(true);
      }
    },
    [chatId, currentUser?.id],
  );

  const handleUserStoppedTyping = useCallback(
    (data: IUserTypingData) => {
      if (data.chat_id === chatId && data.user_id !== currentUser?.id) {
        setOtherUserTyping(false);
      }
    },
    [chatId, currentUser?.id],
  );

  // Set up socket listeners
  useEffect(() => {
    chatSocketService.onNewMessage(handleNewMessage);
    chatSocketService.onMessageSent(handleMessageSent);
    chatSocketService.onUserTyping(handleUserTyping);
    chatSocketService.onUserStoppedTyping(handleUserStoppedTyping);

    return () => {
      chatSocketService.offNewMessage(handleNewMessage);
      chatSocketService.offMessageSent(handleMessageSent);
      chatSocketService.offUserTyping(handleUserTyping);
      chatSocketService.offUserStoppedTyping(handleUserStoppedTyping);
    };
  }, [handleNewMessage, handleMessageSent, handleUserTyping, handleUserStoppedTyping]);

  // Keyboard listeners - use ref to prevent rapid state changes on Android
  useEffect(() => {
    let isCurrentlyVisible = false;

    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        if (!isCurrentlyVisible) {
          isCurrentlyVisible = true;
          setKeyboardVisible(true);
        }
        setKeyboardHeight(e.endCoordinates.height);
      },
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        if (isCurrentlyVisible) {
          isCurrentlyVisible = false;
          setKeyboardVisible(false);
          setKeyboardHeight(0);
        }
      },
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Handle text input changes with typing indicator
  const handleTextChange = useCallback(
    (text: string) => {
      setInputText(text);

      if (text.length > 0 && !isTyping) {
        setIsTyping(true);
        chatSocketService.startTyping(chatId);
      } else if (text.length === 0 && isTyping) {
        setIsTyping(false);
        chatSocketService.stopTyping(chatId);
      }
    },
    [chatId, isTyping],
  );

  // Handle sending a message
  const handleSend = useCallback(() => {
    if (inputText.trim() && chatId) {
      const content = inputText.trim();
      const messageType = replyingTo ? 'reply' : 'text';
      const replyToId = replyingTo?.messageId || null;

      chatSocketService.sendMessage(chatId, content, messageType, replyToId);

      if (isTyping) {
        setIsTyping(false);
        chatSocketService.stopTyping(chatId);
      }

      setInputText('');
      setReplyingTo(null);
    }
  }, [chatId, inputText, isTyping, replyingTo]);

  // Handle reply to message
  const handleReplyToMessage = useCallback((message: IChatMessageItem, senderName: string) => {
    setReplyingTo({
      messageId: message.id,
      content: message.content,
      senderName,
    });
  }, []);

  // Handle cancel reply
  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  // Handle loading more messages (pagination)
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    messages,
    sender,
    currentUserId: currentUser?.id,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    inputText,
    isOtherUserTyping: otherUserTyping,
    isKeyboardVisible,
    keyboardHeight,
    replyingTo,
    handleTextChange,
    handleSend,
    handleLoadMore,
    handleReplyToMessage,
    handleCancelReply,
  };
}
