import { IUser } from '@/src/types/user';

export type TweetUserListType = 'likes' | 'reposts';
export type ProfileUserListType = 'followers' | 'following' | 'mutualFollowers';
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
    data: IUser[];
    nextCursor?: string;
    hasMore?: boolean;
  };
  count: number;
  message: string;
}

export type FetchUserListParams = UserListQuery & { cursor?: string; limit?: number };
