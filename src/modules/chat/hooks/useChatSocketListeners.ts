import { useUnreadMessagesStore } from '@/src/store/useUnreadMessagesStore';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { chatSocketService, INewMessageData, IUnreadChatsSummary } from '../services/chatSocketService';
import { IChat } from '../types';

export function useChatSocketListeners() {
  const queryClient = useQueryClient();
  const setUnreadChatIds = useUnreadMessagesStore((state) => state.setUnreadChatIds);
  const addUnreadChat = useUnreadMessagesStore((state) => state.addUnreadChat);
  const activeChatId = useUnreadMessagesStore((state) => state.activeChatId);

  const handleUnreadSummary = useCallback(
    (data: IUnreadChatsSummary) => {
      const chatIdsWithUnread = data.chats.filter((chat) => chat.unread_count > 0).map((chat) => chat.chat_id);
      setUnreadChatIds(chatIdsWithUnread);
    },
    [setUnreadChatIds],
  );

  const handleNewMessage = useCallback(
    (data: INewMessageData) => {
      const isCurrentlyViewing = data.chat_id === activeChatId;
      if (!isCurrentlyViewing) {
        addUnreadChat(data.chat_id);
      }

      type ChatsData = {
        pages: Array<{ chats: IChat[]; pagination: { nextCursor: string | null; hasMore: boolean } }>;
      };
      queryClient.setQueryData<ChatsData>(['chats'], (oldData) => {
        if (!oldData?.pages) return oldData;

        let targetChat: IChat | null = null;
        const pagesWithoutTarget = oldData.pages.map((page) => ({
          ...page,
          chats: page.chats.filter((chat) => {
            if (chat.id === data.chat_id) {
              targetChat = chat;
              return false;
            }
            return true;
          }),
        }));

        if (!targetChat) {
          queryClient.invalidateQueries({ queryKey: ['chats'] });
          return oldData;
        }
        const foundChat = targetChat as IChat;
        const updatedChat: IChat = {
          ...foundChat,
          lastMessage: {
            id: data.message.id,
            content: data.message.content,
            messageType: data.message.message_type,
            senderId: data.message.sender_id,
            createdAt: data.message.created_at,
            isRead: isCurrentlyViewing, // Mark as read if user is viewing
          },
          unreadCount: isCurrentlyViewing ? 0 : foundChat.unreadCount + 1,
          updatedAt: data.message.created_at,
        };
        const newPages = [...pagesWithoutTarget];
        newPages[0] = {
          ...newPages[0],
          chats: [updatedChat, ...newPages[0].chats],
        };

        return {
          ...oldData,
          pages: newPages,
        };
      });
    },
    [addUnreadChat, activeChatId, queryClient],
  );

  // Subscribe to socket events
  useEffect(() => {
    chatSocketService.onUnreadChatsSummary(handleUnreadSummary);
    chatSocketService.onNewMessage(handleNewMessage);

    return () => {
      chatSocketService.offUnreadChatsSummary(handleUnreadSummary);
      chatSocketService.offNewMessage(handleNewMessage);
    };
  }, [handleUnreadSummary, handleNewMessage]);
}
