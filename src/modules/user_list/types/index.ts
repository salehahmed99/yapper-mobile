import { IUser, IUserDTO } from '@/src/types/user';

export type TweetUserListType = 'likes' | 'reposts';
export type ProfileUserListType = 'followers' | 'following';
export type SettingsUserListType = 'muted' | 'blocked';
export type UserListType = TweetUserListType | ProfileUserListType | SettingsUserListType;

export type UserListQuery =
  | {
      type: TweetUserListType;
      tweetId: string;
    }
  | {
      type: ProfileUserListType;
      userId: string;
    }
  | {
      type: SettingsUserListType;
    };

export interface IUserListResponse {
  users: IUser[];
  nextPage?: number | null;
  nextCursor?: string | null;
  hasMore?: boolean;
}

export interface IUserListResponseBackend {
  data: {
    data: IUserDTO[];
    next_cursor?: string;
    has_more?: boolean;
  };
  count: number;
  message: string;
}

export type FetchUserListParams = UserListQuery & { cursor?: string; limit?: number };
