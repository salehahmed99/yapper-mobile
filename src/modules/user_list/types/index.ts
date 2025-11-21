import { IUser, IUserDTO } from '@/src/types/user';

export type TweetUserListType = 'likes' | 'reposts';
export type ProfileUserListType = 'followers' | 'following';
export type UserListType = TweetUserListType | ProfileUserListType;

export type UserListQuery =
  | {
      type: TweetUserListType;
      tweetId: string;
    }
  | {
      type: ProfileUserListType;
      userId: string;
    };

export interface IUserListResponse {
  users: IUser[];
  nextCursor?: string | null;
  hasMore: boolean;
}

export interface IUserListResponseBackend {
  data: {
    data: IUserDTO[];
    has_more: boolean;
    next_cursor?: string | null;
  };
  count: number;
  message: string;
}

export type FetchUserListParams = UserListQuery & { cursor?: string; limit?: number };
