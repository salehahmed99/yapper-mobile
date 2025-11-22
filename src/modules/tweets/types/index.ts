import { IApiResponse } from '@/src/types/api';
import { IUser } from '@/src/types/user';

type TweetType = 'tweet' | 'reply' | 'repost' | 'quote';

interface ITweet {
  tweetId: string;
  type: TweetType;
  parentTweet?: ITweet;
  conversationId?: string;
  content: string;
  images: string[];
  videos: string[];
  likesCount: number;
  repostsCount: number;
  viewsCount: number;
  quotesCount: number;
  repliesCount: number;
  isLiked: boolean;
  isReposted: boolean;
  createdAt: string;
  updatedAt: string;
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

interface ITweets {
  data: ITweet[];
  pagination: {
    nextCursor: string;
    hasMore: boolean;
  };
}
interface IQuotesResponse {
  data: ITweet[];
  count: number;
  parent?: {
    tweet_id: string;
    user_id: string;
    type: TweetType;
    content: string;
    images: string[];
    videos: string[];
    num_likes: number;
    num_reposts: number;
    num_views: number;
    num_quotes: number;
    num_replies: number;
    num_bookmarks: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  next_cursor?: string;
  has_more: boolean;
}

type ReplyRestrictionOptions = 'Everyone' | 'Verified accounts' | 'Accounts you follow' | 'Only accounts you mention';

export {
  IQuotesResponse,
  ISingleTweetResponse,
  ITweet,
  ITweetFilters,
  ITweets,
  ITweetsResponse,
  ReplyRestrictionOptions,
};
