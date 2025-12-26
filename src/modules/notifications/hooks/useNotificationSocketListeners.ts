import { useNotificationStore } from '@/src/store/useNotificationStore';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { notificationSocketService } from '../services/notificationSocketService';
import {
  IFollowNotificationEvent,
  ILikeNotificationEvent,
  IMentionNotificationEvent,
  INewestCountDataEvent,
  IQuoteNotificationEvent,
  IReplyNotificationEvent,
  IRepostNotificationEvent,
} from '../types/events';

export function useNotificationSocketListeners() {
  const queryClient = useQueryClient();
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const incrementUnreadCount = useNotificationStore((state) => state.incrementUnreadCount);

  // Handle newest count updates
  const handleNewestCount = useCallback(
    (data: INewestCountDataEvent) => {
      // console.log('[NotificationSocket] Newest count:', data.newest_count);
      setUnreadCount(data.newest_count);
    },
    [setUnreadCount],
  );

  // Handle follow notifications
  const handleFollow = useCallback(
    (data: IFollowNotificationEvent) => {
      // console.log('[NotificationSocket] Follow notification:', data);

      // Invalidate notifications query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // Update unread count based on action
      if (data.action === 'add' || data.action === 'aggregate') {
        incrementUnreadCount();
      }
    },
    [queryClient, incrementUnreadCount],
  );

  // Handle like notifications
  const handleLike = useCallback(
    (data: ILikeNotificationEvent) => {
      // console.log('[NotificationSocket] Like notification:', data);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      if (data.action === 'add' || data.action === 'aggregate') {
        incrementUnreadCount();
      }
    },
    [queryClient, incrementUnreadCount],
  );

  // Handle reply notifications
  const handleReply = useCallback(
    (data: IReplyNotificationEvent) => {
      // console.log('[NotificationSocket] Reply notification:', data);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      if (data.action === 'add') {
        incrementUnreadCount();
      }
    },
    [queryClient, incrementUnreadCount],
  );

  // Handle repost notifications
  const handleRepost = useCallback(
    (data: IRepostNotificationEvent) => {
      // console.log('[NotificationSocket] Repost notification:', data);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      if (data.action === 'add' || data.action === 'aggregate') {
        incrementUnreadCount();
      }
    },
    [queryClient, incrementUnreadCount],
  );

  // Handle quote notifications
  const handleQuote = useCallback(
    (data: IQuoteNotificationEvent) => {
      // console.log('[NotificationSocket] Quote notification:', data);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      if (data.action === 'add') {
        incrementUnreadCount();
      }
    },
    [queryClient, incrementUnreadCount],
  );

  // Handle mention notifications
  const handleMention = useCallback(
    (data: IMentionNotificationEvent) => {
      // console.log('[NotificationSocket] Mention notification:', data);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      if (data.action === 'add') {
        incrementUnreadCount();
      }
    },
    [queryClient, incrementUnreadCount],
  );

  // Subscribe to socket events
  useEffect(() => {
    notificationSocketService.onNewestCount(handleNewestCount);
    notificationSocketService.onFollow(handleFollow);
    notificationSocketService.onLike(handleLike);
    notificationSocketService.onReply(handleReply);
    notificationSocketService.onRepost(handleRepost);
    notificationSocketService.onQuote(handleQuote);
    notificationSocketService.onMention(handleMention);

    return () => {
      notificationSocketService.offNewestCount(handleNewestCount);
      notificationSocketService.offFollow(handleFollow);
      notificationSocketService.offLike(handleLike);
      notificationSocketService.offReply(handleReply);
      notificationSocketService.offRepost(handleRepost);
      notificationSocketService.offQuote(handleQuote);
      notificationSocketService.offMention(handleMention);
    };
  }, [handleNewestCount, handleFollow, handleLike, handleReply, handleRepost, handleQuote, handleMention]);
}
