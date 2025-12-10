import { ITweet } from '@/src/modules/tweets/types';

// ===== Trend Types (for /trend endpoint) =====

export interface ITrendItem {
  hashtag: string;
  postsCount: number;
  category: string;
}

export interface ITrendListResponse {
  data: {
    data: ITrendItem[];
  };
  count: number;
  message: string;
}

// ===== Explore Types (for /explore endpoint) =====

export interface IExploreTrending {
  text: string;
  postsCount: number;
  referenceId: string;
  category: string;
  trendRank: number;
}

export interface IExploreUser {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatarUrl: string;
  verified: boolean;
  followers: number;
  following: number;
  isFollowing: boolean;
  isFollowed: boolean;
}

export interface IExploreCategory {
  category: {
    id: string;
    name: string;
  };
  tweets?: ITweet[]; // Some categories use "tweets"
  posts?: ITweet[]; // Some categories use "posts"
}

export interface IExploreData {
  trending: {
    data: IExploreTrending[];
  };
  whoToFollow: IExploreUser[];
  forYou: IExploreCategory[]; // API uses "forYou" not "forYouPosts"
}

export interface IExploreResponse {
  data: IExploreData;
  count: number;
  message: string;
}

// ===== Who To Follow Types (for /explore/who-to-follow endpoint) =====

export interface IWhoToFollowResponse {
  data: IExploreUser[];
  count: number;
  message: string;
}

// ===== Category Tweets Types (for /explore/category/{id} endpoint) =====

export interface ICategoryTweetsData {
  category: {
    id: string;
    name: string;
  };
  tweets: ITweet[];
  pagination: {
    page: number;
    hasMore: boolean;
  };
  message: string;
}

export interface ICategoryTweetsResponse {
  data: ICategoryTweetsData;
}

// ===== Tab Types =====

export type ExploreTab = 'forYou' | 'trending' | 'news' | 'sports' | 'entertainment';

export interface IExploreQuery {
  tab: ExploreTab;
  page?: number;
}
