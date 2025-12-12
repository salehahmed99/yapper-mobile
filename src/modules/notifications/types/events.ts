import { INotificationTweet, INotificationUser } from './common';

// Newest count event
export interface INewestCountDataEvent {
  newest_count: number;
}

// Follow notification
export interface IFollowNotificationAddEvent {
  id: string;
  type: 'follow';
  created_at: string;
  follower_id: string;
  followed_id: string;
  action: 'add';
  follower_avatar_url: string | null;
  follower_name: string;
}

export interface IFollowNotificationAggregateEvent {
  id: string;
  type: 'follow';
  created_at: string;
  followers: INotificationUser[];
  action: 'aggregate';
  old_notification: {
    id: string;
    type: 'follow';
    created_at: string;
    follower_id: string[];
  };
}

export interface IFollowNotificationRemoveEvent {
  id: string;
  type: 'follow';
  follower_id: string;
  followed_id: string;
  action: 'remove';
}

// Like notification
export interface ILikeNotificationAddEvent {
  id: string;
  type: 'like';
  created_at: string;
  liker: INotificationUser;
  tweet: INotificationTweet;
  like_to: string;
  liked_by: string;
  action: 'add';
}

export interface ILikeNotificationAggregateEvent {
  id: string;
  type: 'like';
  created_at: string;
  likers: INotificationUser[];
  tweets: INotificationTweet[];
  action: 'aggregate';
  old_notification: {
    id: string;
    type: 'like';
    created_at: string;
    tweet_id: string[];
    liked_by: string[];
  };
}

export interface ILikeNotificationRemoveEvent {
  id: string;
  tweet_id: string;
  like_to: string;
  liked_by: string;
  action: 'remove';
}

// Reply notification
export interface IReplyNotificationAddEvent {
  id: string;
  type: 'reply';
  created_at: string;
  replier: INotificationUser;
  reply_tweet: INotificationTweet;
  original_tweet_id: string;
  replied_by: string;
  reply_to: string;
  conversation_id: string;
  action: 'add';
}

export interface IReplyNotificationRemoveEvent {
  id: string;
  reply_tweet_id: string;
  reply_to: string;
  replied_by: string;
  action: 'remove';
}

// Repost notification
export interface IRepostNotificationAddEvent {
  id: string;
  type: 'repost';
  created_at: string;
  reposter: INotificationUser;
  repost_to: string;
  reposted_by: string;
  tweet: INotificationTweet;
  action: 'add';
}

export interface IRepostNotificationAggregateEvent {
  id: string;
  type: 'repost';
  created_at: string;
  reposters: INotificationUser[];
  tweets: INotificationTweet[];
  action: 'aggregate';
  old_notification: {
    id: string;
    type: 'repost';
    created_at: string;
    tweet_id: string[];
    reposted_by: string[];
  };
}

export interface IRepostNotificationRemoveEvent {
  id: string;
  repost_to: string;
  reposted_by: string;
  tweet_id: string;
  action: 'remove';
}

// Quote notification
export interface IQuoteNotificationAddEvent {
  id: string;
  type: 'quote';
  created_at: string;
  quoted_by: INotificationUser;
  quote: INotificationTweet;
  action: 'add';
}

export interface IQuoteNotificationRemoveEvent {
  id: string;
  quote_tweet_id: string;
  quote_to: string;
  quoted_by: string;
  action: 'remove';
}

// Mention notification
export interface IMentionNotificationAddEvent {
  id: string;
  type: 'mention';
  created_at: string;
  mentioned_by: INotificationUser;
  tweet_type: 'tweet' | 'quote' | 'reply';
  tweet: INotificationTweet;
  action: 'add';
}

export interface IMentionNotificationRemoveEvent {
  id: string;
  tweet_id: string;
  mentioned_by: string;
  action: 'remove';
}

export const NotificationSocketEvents = {
  // Client -> Server events
  MARK_SEEN: 'mark_seen',

  // Server -> Client events
  NEWEST_COUNT: 'newest_count',
  FOLLOW: 'follow',
  LIKE: 'like',
  REPLY: 'reply',
  REPOST: 'repost',
  QUOTE: 'quote',
  MENTION: 'mention',
} as const;

export type IFollowNotificationEvent =
  | IFollowNotificationAddEvent
  | IFollowNotificationAggregateEvent
  | IFollowNotificationRemoveEvent;
export type ILikeNotificationEvent =
  | ILikeNotificationAddEvent
  | ILikeNotificationAggregateEvent
  | ILikeNotificationRemoveEvent;
export type IReplyNotificationEvent = IReplyNotificationAddEvent | IReplyNotificationRemoveEvent;
export type IRepostNotificationEvent =
  | IRepostNotificationAddEvent
  | IRepostNotificationAggregateEvent
  | IRepostNotificationRemoveEvent;
export type IQuoteNotificationEvent = IQuoteNotificationAddEvent | IQuoteNotificationRemoveEvent;
export type IMentionNotificationEvent = IMentionNotificationAddEvent | IMentionNotificationRemoveEvent;

export type INotificationEvent =
  | IFollowNotificationEvent
  | ILikeNotificationEvent
  | IReplyNotificationEvent
  | IRepostNotificationEvent
  | IQuoteNotificationEvent
  | IMentionNotificationEvent;
