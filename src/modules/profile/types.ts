import { IUser } from '@/src/types/user';

// Backend response is already in camelCase
interface IGetMyUserResponse {
  userId: string;
  name: string;
  username: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string | null;
  country: string | null;
  createdAt: string;
  followersCount: number;
  followingCount: number;
}

export { IGetMyUserResponse };

// Get User By ID Types - Backend response is already in camelCase
interface IUserProfile extends IUser {
  isFollower: boolean;
  isFollowing: boolean;
  isMuted: boolean;
  isBlocked: boolean;
  topMutualFollowers: unknown[];
  mutualFollowersCount: number;
  followersCount: number;
  followingCount: number;
}

interface IGetUserByIdResponse {
  userId: string;
  name: string;
  username: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string | null;
  country: string | null;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  isFollower: boolean;
  isFollowing: boolean;
  isMuted: boolean;
  isBlocked: boolean;
  topMutualFollowers: unknown[];
  mutualFollowersCount: string;
}

export { IGetUserByIdResponse, IUserProfile };

// Followers List Types - Backend response is already in camelCase
interface IFollowerUser {
  userId: string;
  name: string;
  username: string;
  bio: string | null;
  avatarUrl: string;
  isFollowing: boolean;
  isFollower: boolean;
  isMuted: boolean;
  isBlocked: boolean;
}

interface IGetFollowersListResponse {
  data: IFollowerUser[];
  count: number;
  message: string;
}

interface IGetFollowersListParams {
  userId: string;
  pageOffset?: number;
  pageSize?: number;
  following?: boolean;
}

export { IFollowerUser, IGetFollowersListParams, IGetFollowersListResponse };

// Following List Types
interface IGetFollowingListParams {
  userId: string;
  pageOffset?: number;
  pageSize?: number;
}

interface IGetFollowingListResponse {
  data: IFollowerUser[];
  count: number;
  message: string;
}

export { IGetFollowingListParams, IGetFollowingListResponse };
