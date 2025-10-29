import { IUser } from '@/src/types/user';

export type UserListType = 'likers' | 'retweeters';

export interface IUserListUser extends IUser {
  username?: string;
  bio?: string;
  isFollowing?: boolean;
}

export interface IUserListResponse {
  users: IUserListUser[];
  nextCursor?: string | null;
}

export interface FetchUserListParams {
  tweetId: string;
  type: UserListType;
  cursor?: string | null;
}
