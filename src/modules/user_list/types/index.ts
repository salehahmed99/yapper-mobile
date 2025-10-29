import { IUser } from '@/src/types/user';

export type TweetUserListType = 'likers' | 'retweeters';
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

export interface IUserListUser extends IUser {
  username?: string;
  bio?: string;
  isFollowing?: boolean;
  isFollowed?: boolean;
}

export interface IUserListResponse {
  users: IUserListUser[];
  nextPage?: number | null;
}

export type FetchUserListParams = UserListQuery & { page?: number | null };
