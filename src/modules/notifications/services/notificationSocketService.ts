import { socketService } from '@/src/services/socketService';
import {
  IFollowNotificationEvent,
  ILikeNotificationEvent,
  IMentionNotificationEvent,
  INewestCountDataEvent,
  IQuoteNotificationEvent,
  IReplyNotificationEvent,
  IRepostNotificationEvent,
  NotificationSocketEvents,
} from '../types';

// ============================================================================
// Notification Socket Service
// ============================================================================

class NotificationSocketService {
  // -------------------------------------------------------------------------
  // Emit Methods (Client -> Server)
  // -------------------------------------------------------------------------

  // Mark notifications as seen
  public markSeen(): void {
    socketService.emit(NotificationSocketEvents.MARK_SEEN, {});
    console.log('[NotificationSocket] Marking notifications as seen');
  }

  // -------------------------------------------------------------------------
  // Event Listeners (Server -> Client)
  // -------------------------------------------------------------------------

  // Listen for newest count updates
  public onNewestCount(callback: (data: INewestCountDataEvent) => void): void {
    socketService.on(NotificationSocketEvents.NEWEST_COUNT, callback);
  }

  // Listen for follow notifications
  public onFollow(callback: (data: IFollowNotificationEvent) => void): void {
    socketService.on(NotificationSocketEvents.FOLLOW, callback);
  }

  // Listen for like notifications
  public onLike(callback: (data: ILikeNotificationEvent) => void): void {
    socketService.on(NotificationSocketEvents.LIKE, callback);
  }

  // Listen for reply notifications
  public onReply(callback: (data: IReplyNotificationEvent) => void): void {
    socketService.on(NotificationSocketEvents.REPLY, callback);
  }

  // Listen for repost notifications
  public onRepost(callback: (data: IRepostNotificationEvent) => void): void {
    socketService.on(NotificationSocketEvents.REPOST, callback);
  }

  // Listen for quote notifications
  public onQuote(callback: (data: IQuoteNotificationEvent) => void): void {
    socketService.on(NotificationSocketEvents.QUOTE, callback);
  }

  // Listen for mention notifications
  public onMention(callback: (data: IMentionNotificationEvent) => void): void {
    socketService.on(NotificationSocketEvents.MENTION, callback);
  }

  // -------------------------------------------------------------------------
  // Remove Listeners
  // -------------------------------------------------------------------------

  public offNewestCount(callback: (data: INewestCountDataEvent) => void): void {
    socketService.off(NotificationSocketEvents.NEWEST_COUNT, callback);
  }

  public offFollow(callback: (data: IFollowNotificationEvent) => void): void {
    socketService.off(NotificationSocketEvents.FOLLOW, callback);
  }

  public offLike(callback: (data: ILikeNotificationEvent) => void): void {
    socketService.off(NotificationSocketEvents.LIKE, callback);
  }

  public offReply(callback: (data: IReplyNotificationEvent) => void): void {
    socketService.off(NotificationSocketEvents.REPLY, callback);
  }

  public offRepost(callback: (data: IRepostNotificationEvent) => void): void {
    socketService.off(NotificationSocketEvents.REPOST, callback);
  }

  public offQuote(callback: (data: IQuoteNotificationEvent) => void): void {
    socketService.off(NotificationSocketEvents.QUOTE, callback);
  }

  public offMention(callback: (data: IMentionNotificationEvent) => void): void {
    socketService.off(NotificationSocketEvents.MENTION, callback);
  }
}

export const notificationSocketService = new NotificationSocketService();
