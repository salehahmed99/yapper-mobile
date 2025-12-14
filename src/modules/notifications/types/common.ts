// ============================================================================
// Common Types for Notifications Module
// ============================================================================

import { TweetType } from '../../tweets/types';

// Common user info structure
export interface INotificationUser {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar_url?: string;
}

// Common tweet structure (uses num_* fields)
export interface INotificationTweet {
  tweet_id: string;
  type: TweetType;
  content: string;
  images: string[];
  videos: string[];
  likes_count: number;
  reposts_count: number;
  views_count: number;
  quotes_count: number;
  replies_count: number;
  bookmarks_count: number;
  is_bookmarked: boolean;
  is_liked: boolean;
  is_reposted: boolean;
  parent_tweet?: INotificationTweet;
  created_at: string;
  updated_at?: string;
}

export interface INotificationTweetApi {
  tweetId: string;
  type: TweetType;
  parentTweet?: INotificationTweetApi;
  mentions: string[];
  content: string;
  images: string[];
  videos: string[];
  likesCount: number;
  repostsCount: number;
  viewsCount: number;
  quotesCount: number;
  repliesCount: number;
  bookmarksCount?: number;
  isLiked: boolean;
  isReposted: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt?: string;
}
