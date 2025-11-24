import { IUser } from '@/src/types/user';

interface IGetMyUserResponse {
  userId: string;
  name: string;
  username: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string | null;
  country: string | null;
  birthDate?: string;
  createdAt: string;
  followersCount: number;
  followingCount: number;
}

export { IGetMyUserResponse };

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

interface IFollowersPagination {
  nextCursor: string | null;
  hasMore: boolean;
}

interface IGetFollowersListResponse {
  data: {
    data: IFollowerUser[];
    pagination: IFollowersPagination;
  };
  count: number;
  message: string;
}

interface IGetFollowersListParams {
  userId: string;
  cursor?: string;
  limit?: number;
  following?: boolean;
}

export { IFollowersPagination, IFollowerUser, IGetFollowersListParams, IGetFollowersListResponse };

interface IGetFollowingListParams {
  userId: string;
  cursor?: string;
  limit?: number;
}

interface IGetFollowingListResponse {
  data: {
    data: IFollowerUser[];
    pagination: IFollowersPagination;
  };
  count: number;
  message: string;
}

export { IGetFollowingListParams, IGetFollowingListResponse };

interface IUserPostsParams {
  userId: string;
  cursor?: string;
  limit?: number;
}

interface IUserPostsPagination {
  nextCursor: string | null;
  hasMore: boolean;
}

interface IUserPostsResponse {
  data: {
    data: unknown[];
    pagination: IUserPostsPagination;
  };
  count: number;
  message: string;
}

export { IUserPostsPagination, IUserPostsParams, IUserPostsResponse };

interface IUserMediaParams {
  userId: string;
  cursor?: string;
  limit?: number;
}

interface IUserMediaResponse {
  data: {
    data: unknown[];
    pagination: IUserPostsPagination;
  };
  count: number;
  message: string;
}

export { IUserMediaParams, IUserMediaResponse };

interface IUserLikesParams {
  userId: string;
  cursor?: string;
  limit?: number;
}

interface IUserLikesResponse {
  data: {
    data: unknown[];
    pagination: IUserPostsPagination;
  };
  count: number;
  message: string;
}

export { IUserLikesParams, IUserLikesResponse };

interface IUserRepliesParams {
  userId: string;
  cursor?: string;
  limit?: number;
}

interface IUserRepliesResponse {
  data: {
    data: unknown[];
    pagination: IUserPostsPagination;
  };
  count: number;
  message: string;
}

export { IUserRepliesParams, IUserRepliesResponse };
