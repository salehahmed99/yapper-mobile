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

type ReplyRestrictionOptions = 'Everyone' | 'Verified accounts' | 'Accounts you follow' | 'Only accounts you mention';

export { ISingleTweetResponse, ITweet, ITweetFilters, ITweets, ITweetsResponse, ReplyRestrictionOptions };
