import { useAuthStore } from '@/src/store/useAuthStore';
import { useUnreadMessagesStore } from '@/src/store/useUnreadMessagesStore';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import { getMessages } from '../services/chatService';
import {
  chatSocketService,
  IMessageSentData,
  INewMessageData,
  IReactionAddedData,
  IReactionRemovedData,
  IUserTypingData,
} from '../services/chatSocketService';
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
  handleSend: (imageUrl?: string | null, voiceNoteUrl?: string | null, voiceNoteDuration?: string | null) => void;
  handleLoadMore: () => void;
  handleReplyToMessage: (message: IChatMessageItem, senderName: string) => void;
  handleCancelReply: () => void;
  handleReactToMessage: (messageId: string, emoji: string) => void;
  handleRemoveReactToMessage: (messageId: string, emoji: string) => void;
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

  const { messages, sender } = useMemo(() => {
    if (!messagesData?.pages.length) {
      return { messages: [], sender: null };
    }
    const senderInfo = messagesData.pages[0]?.sender || null;
    const reversedPages = [...messagesData.pages].reverse();
    const allMessages = reversedPages.flatMap((page) => page.messages);
    return { messages: allMessages, sender: senderInfo };
  }, [messagesData]);

  const removeUnreadChat = useUnreadMessagesStore((state) => state.removeUnreadChat);
  const setActiveChatId = useUnreadMessagesStore((state) => state.setActiveChatId);

  useEffect(() => {
    if (!chatId) return;
    setActiveChatId(chatId);
    removeUnreadChat(chatId);
    const chatsData = queryClient.getQueryData<{ pages: Array<{ chats: Array<{ id: string; unreadCount: number }> }> }>(
      ['chats'],
    );
    if (chatsData?.pages) {
      queryClient.setQueryData(['chats'], (oldData: typeof chatsData) => {
        if (!oldData?.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((p) => ({
            ...p,
            chats: p.chats.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c)),
          })),
        };
      });
    }

    chatSocketService.joinChat(chatId);

    return () => {
      chatSocketService.leaveChat(chatId);
      setActiveChatId(null); // Clear active chat when leaving
    };
  }, [chatId, removeUnreadChat, setActiveChatId, queryClient]);

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
        voiceNoteUrl: data.message.voice_note_url || null,
        voiceNoteDuration: data.message.voice_note_duration || null,
        imageUrl: data.message.image_url || null,
        isRead: data.message.is_read,
        createdAt: data.message.created_at,
        updatedAt: data.message.updated_at || data.message.created_at,
        senderId: data.message.sender?.id,
      };

      // Add the new message to the cache (check for duplicates first)
      queryClient.setQueryData(['messages', chatId], (oldData: typeof messagesData) => {
        if (!oldData?.pages?.length) return oldData;
        const allMessages = oldData.pages.flatMap((page) => page.messages);
        if (allMessages.some((msg) => msg.id === newMessage.id)) {
          return oldData;
        }
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
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    [chatId, queryClient, currentUser?.id],
  );

  // Handle message sent confirmation
  const handleMessageSent = useCallback(
    (data: IMessageSentData) => {
      // Validate that this message belongs to the current chat
      if (data.chat_id && data.chat_id !== chatId) {
        return;
      }

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
        imageUrl: data.image_url || null,
        voiceNoteUrl: data.voice_note_url || null,
        voiceNoteDuration: data.voice_note_duration || null,
        isRead: data.is_read,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at,
        senderId: data.sender_id,
      };

      queryClient.setQueryData(['messages', chatId], (oldData: typeof messagesData) => {
        if (!oldData?.pages?.length) return oldData;
        const allMessages = oldData.pages.flatMap((page) => page.messages);
        if (allMessages.some((msg) => msg.id === newMessage.id)) {
          return oldData;
        }
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
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    [chatId, queryClient],
  );
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

  // Handle reaction added
  const handleReactionAdded = useCallback(
    (data: IReactionAddedData) => {
      // Validate data completness
      if (!data || !data.chat_id || !data.message_id || !data.emoji || !data.user_id) return;
      if (data.chat_id !== chatId) return;

      const isFromCurrentUser = data.user_id === currentUser?.id;

      queryClient.setQueryData(['messages', chatId], (oldData: typeof messagesData) => {
        if (!oldData?.pages?.length) return oldData;

        const newPages = oldData.pages.map((page) => ({
          ...page,
          messages: page.messages.map((msg) => {
            if (msg.id !== data.message_id) return msg;

            let existingReactions = msg.reactions || [];

            // If this is a new reaction from the current user, remove their previous reaction of a different emoji
            if (isFromCurrentUser) {
              existingReactions = existingReactions.map((r) => {
                if (r.reactedByMe && r.emoji !== data.emoji) {
                  return { ...r, reactedByMe: false };
                }
                return r;
              });
            } else {
              // For other user, remove their previous reaction of a different emoji
              existingReactions = existingReactions.map((r) => {
                if (r.reactedByOther && r.emoji !== data.emoji) {
                  return { ...r, reactedByOther: false };
                }
                return r;
              });
            }

            // Check if this emoji already exists
            const existingIdx = existingReactions.findIndex((r) => r.emoji === data.emoji);

            let updatedReactions = [...existingReactions];
            if (existingIdx >= 0) {
              updatedReactions = updatedReactions.map((r, i) =>
                i === existingIdx
                  ? {
                      ...r,
                      reactedByMe: isFromCurrentUser ? true : r.reactedByMe,
                      reactedByOther: !isFromCurrentUser ? true : r.reactedByOther,
                    }
                  : r,
              );
            } else {
              updatedReactions.push({
                emoji: data.emoji,
                count: 1,
                reactedByMe: isFromCurrentUser,
                reactedByOther: !isFromCurrentUser,
              });
            }

            // Recalculate counts and filter out empty reactions
            updatedReactions = updatedReactions
              .map((r) => {
                const newCount = (r.reactedByMe ? 1 : 0) + (r.reactedByOther ? 1 : 0);
                return { ...r, count: newCount };
              })
              .filter((r) => r.count > 0);

            return { ...msg, reactions: updatedReactions };
          }),
        }));

        return { ...oldData, pages: newPages };
      });
    },
    [chatId, queryClient, currentUser?.id],
  );

  // Handle reaction removed
  const handleReactionRemoved = useCallback(
    (data: IReactionRemovedData) => {
      // Validate data completness - strict check to ignore "Reaction removed successfully" messages
      if (!data || !data.chat_id || !data.message_id || !data.emoji || !data.user_id) return;
      if (data.chat_id !== chatId) return;

      const isFromCurrentUser = data.user_id === currentUser?.id;

      queryClient.setQueryData(['messages', chatId], (oldData: typeof messagesData) => {
        if (!oldData?.pages?.length) return oldData;

        const newPages = oldData.pages.map((page) => ({
          ...page,
          messages: page.messages.map((msg) => {
            if (msg.id !== data.message_id) return msg;

            if (!msg.reactions) return msg;

            let updatedReactions = msg.reactions.map((r) => {
              if (r.emoji === data.emoji) {
                return {
                  ...r,
                  reactedByMe: isFromCurrentUser ? false : r.reactedByMe,
                  reactedByOther: !isFromCurrentUser ? false : r.reactedByOther,
                };
              }
              return r;
            });

            // Recalculate counts and filter out empty reactions
            updatedReactions = updatedReactions
              .map((r) => {
                const newCount = (r.reactedByMe ? 1 : 0) + (r.reactedByOther ? 1 : 0);
                return { ...r, count: newCount };
              })
              .filter((r) => r.count > 0);

            return { ...msg, reactions: updatedReactions };
          }),
        }));

        return { ...oldData, pages: newPages };
      });
    },
    [chatId, queryClient, currentUser?.id],
  );

  // Set up socket listeners
  useEffect(() => {
    chatSocketService.onNewMessage(handleNewMessage);
    chatSocketService.onMessageSent(handleMessageSent);
    chatSocketService.onUserTyping(handleUserTyping);
    chatSocketService.onUserStoppedTyping(handleUserStoppedTyping);
    chatSocketService.onReactionAdded(handleReactionAdded);
    chatSocketService.onReactionRemoved(handleReactionRemoved);

    return () => {
      chatSocketService.offNewMessage(handleNewMessage);
      chatSocketService.offMessageSent(handleMessageSent);
      chatSocketService.offUserTyping(handleUserTyping);
      chatSocketService.offUserStoppedTyping(handleUserStoppedTyping);
      chatSocketService.offReactionAdded(handleReactionAdded);
      chatSocketService.offReactionRemoved(handleReactionRemoved);
    };
  }, [
    handleNewMessage,
    handleMessageSent,
    handleUserTyping,
    handleUserStoppedTyping,
    handleReactionAdded,
    handleReactionRemoved,
  ]);

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

  const handleSend = useCallback(
    (imageUrl?: string | null, voiceNoteUrl?: string | null, voiceNoteDuration?: string | null) => {
      // For voice notes, we send even without text content
      if ((!inputText.trim() && !imageUrl && !voiceNoteUrl) || !chatId) return;

      const content = inputText.trim();
      const messageType = voiceNoteUrl ? 'voice' : replyingTo ? 'reply' : 'text';
      const replyToId = replyingTo?.messageId || null;
      const isFirstMessage = messages.length === 0;

      chatSocketService.sendMessage(
        chatId,
        content,
        messageType,
        replyToId,
        imageUrl || null,
        isFirstMessage,
        voiceNoteUrl || null,
        voiceNoteDuration || null,
      );

      if (isTyping) {
        setIsTyping(false);
        chatSocketService.stopTyping(chatId);
      }

      setInputText('');
      setReplyingTo(null);
    },
    [chatId, inputText, isTyping, replyingTo, messages.length],
  );

  // Handle reply to message
  const handleReplyToMessage = useCallback((message: IChatMessageItem, senderName: string) => {
    setReplyingTo({
      messageId: message.id,
      content: message.content,
      senderName,
      hasImage: !!message.imageUrl,
      hasVoice: !!message.voiceNoteUrl || message.messageType === 'voice',
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

  // Handle react to message
  const handleReactToMessage = useCallback(
    (messageId: string, emoji: string) => {
      if (!chatId) return;
      chatSocketService.addReaction(chatId, messageId, emoji);
    },
    [chatId],
  );

  // Handle remove reaction from message
  const handleRemoveReactToMessage = useCallback(
    (messageId: string, emoji: string) => {
      if (!chatId) return;
      chatSocketService.removeReaction(chatId, messageId, emoji);
    },
    [chatId],
  );

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
    handleReactToMessage,
    handleRemoveReactToMessage,
  };
}
