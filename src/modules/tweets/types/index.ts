import { IApiResponse } from '@/src/types/api';
import { IUser } from '@/src/types/user';

export type TweetType = 'tweet' | 'reply' | 'repost' | 'quote';

interface ITweet {
  tweetId: string;
  type: TweetType;
  postType?: 'tweet' | 'reply' | 'quote';
  parentTweet?: ITweet;
  conversationTweet?: ITweet;
  replies?: ITweet[];
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
  user: IUser;
  repostedBy?: {
    repostId: string;
    id: string;
    name: string;
    repostedAt: string;
  };
}

interface ITweetFilters {
  userId?: string;
  cursor?: string;
  limit?: number;
}

type ISingleTweetResponse = IApiResponse<ITweet>;
type ITweetsResponse = IApiResponse<ITweets>;
type IRepliesResponse = IApiResponse<IReplies>;
type IBookmarksResponse = IApiResponse<IBookmarks>;

interface ITweets {
  data: ITweet[];
  pagination: {
    nextCursor: string;
    hasMore: boolean;
  };
}

interface IBookmarks {
  data: ITweet[];
  pagination: {
    count: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
}

interface IReplies {
  data: ITweet[];
  count: number;
  nextCursor: string;
  hasMore: boolean;
}
interface IQuotesResponse {
  data: ITweet[];
  count: number;
  parent?: {
    tweetId: string;
    userId: string;
    type: TweetType;
    content: string;
    images: string[];
    videos: string[];
    numLikes: number;
    numReposts: number;
    numViews: number;
    numQuotes: number;
    numReplies: number;
    numBookmarks: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    user: IUser;
  };
  nextCursor?: string;
  hasMore: boolean;
}

interface ITweetSummary {
  tweetId: string;
  summary: string;
}

type ITweetSummaryResponse = IApiResponse<ITweetSummary>;

export {
  IBookmarks,
  IBookmarksResponse,
  IQuotesResponse,
  IReplies,
  IRepliesResponse,
  ISingleTweetResponse,
  ITweet,
  ITweetFilters,
  ITweets,
  ITweetsResponse,
  ITweetSummaryResponse,
};
