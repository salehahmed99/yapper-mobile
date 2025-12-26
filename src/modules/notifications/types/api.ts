import { IApiResponse } from '@/src/types/api';
import { IUser } from '@/src/types/user';
import { INotificationTweetApi } from './common';
// ============================================================================
// Backend API Response Types (for GET /notifications)
// ============================================================================

// Follow notification from backend
export interface IFollowNotification {
  id: string;
  type: 'follow';
  createdAt: string;
  followers: IUser[];
}

// Like notification from backend
export interface ILikeNotification {
  id: string;
  type: 'like';
  createdAt: string;
  likers: IUser[];
  tweets: INotificationTweetApi[];
}

// Quote notification from backend
export interface IQuoteNotification {
  id: string;
  type: 'quote';
  createdAt: string;
  quoter: IUser;
  quoteTweet: INotificationTweetApi;
}

// Reply notification from backend
export interface IReplyNotification {
  id: string;
  type: 'reply';
  createdAt: string;
  replier: IUser;
  replyTweet: INotificationTweetApi;
  originalTweet: INotificationTweetApi;
  conversationId: string;
}

// Repost notification from backend
export interface IRepostNotification {
  id: string;
  type: 'repost';
  createdAt: string;
  reposters: IUser[];
  tweets: INotificationTweetApi[];
}

// Mention notification from backend
export interface IMentionNotification {
  id: string;
  type: 'mention';
  createdAt: string;
  mentioner: IUser;
  tweet: INotificationTweetApi;
  tweetType: 'tweet' | 'quote' | 'reply';
}

// Message notification from backend
export interface IMessageNotification {
  id: string;
  type: 'message';
  createdAt: string;
  sender: IUser;
  messageId: string;
  chatId: string;
}
// Union type for all notification types from backend
export type INotification =
  | IFollowNotification
  | ILikeNotification
  | IMessageNotification
  | IQuoteNotification
  | IReplyNotification
  | IRepostNotification
  | IMentionNotification;

export interface INotifications {
  notifications: INotification[];
  page: number;
  totalPages: number;
  pageSize: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export type INotificationsResponse = IApiResponse<INotifications>;
export type INotificationType = 'follow' | 'like' | 'message' | 'quote' | 'reply' | 'repost' | 'mention';
