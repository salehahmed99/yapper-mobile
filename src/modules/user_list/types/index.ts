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
  data: {
    data: IUserDTO[];
    pagination: {
      total_items: number;
      total_pages: number;
      current_page: number;
      items_per_page: number;
      has_next_page: boolean;
      has_previous_page: boolean;
    };
  };
  count: number;
  message: string;
}

export type FetchUserListParams = UserListQuery & { page?: number | null };
