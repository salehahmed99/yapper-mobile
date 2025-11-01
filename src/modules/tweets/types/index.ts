import { IApiResponse } from '@/src/types/api';
import { IUserDTO } from '@/src/types/user';

type TweetType = 'tweet' | 'reply' | 'repost' | 'quote';

interface ITweet {
  tweet_id: string;
  type: TweetType;
  parent_tweet_id?: string;
  conversation_id?: string;
  content: string;
  images: string[];
  videos: string[];
  likes_count: number;
  reposts_count: number;
  views_count: number;
  quotes_count: number;
  replies_count: number;
  is_liked: boolean;
  is_reposted: boolean;
  created_at: string;
  updated_at: string;
  user: IUserDTO;
  reposted_by?: {
    repost_id: string;
    id: string;
    name: string;
    reposted_at: string;
  };
}

interface ITweetFilters {
  user_id?: string;
  cursor?: string;
  limit?: number;
}

type ISingleTweetResponse = IApiResponse<ITweet>;
type ITweetsResponse = IApiResponse<ITweets>;

interface ITweets {
  data: ITweet[];
  next_cursor?: string;
  count: number;
  has_more: boolean;
}

export { ISingleTweetResponse, ITweet, ITweetFilters, ITweets, ITweetsResponse };
