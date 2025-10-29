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
  nextPage?: number | null;
}

export interface IUserListResponseBackend {
  users: IUserDTO[];
  nextPage?: number | null;
}

export type FetchUserListParams = UserListQuery & { page?: number | null };
