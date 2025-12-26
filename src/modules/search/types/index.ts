import { ITweet } from '@/src/modules/tweets/types';
import { IUser } from '@/src/types/user';

// Search Suggestions Types
export interface ISuggestedQuery {
  query: string;
  isTrending: boolean;
}

export interface ISuggestedUser {
  userId: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  isFollowing: boolean;
  isFollower: boolean;
}

export interface ISearchSuggestionsResponse {
  data: {
    suggestedQueries: ISuggestedQuery[];
    suggestedUsers: ISuggestedUser[];
  };
  count: number;
  message: string;
}

// Search Posts Types
export interface ISearchPostsResponse {
  data: {
    data: ITweet[];
    pagination: {
      nextCursor: string | null;
      hasMore: boolean;
    };
  };
  count: number;
  message: string;
}

// Search Users Types
export interface ISearchUserResult {
  userId: string;
  name: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  verified: boolean;
  followers: number;
  following: number;
  isFollowing: boolean;
  isFollower: boolean;
  isMuted: boolean;
  isBlocked: boolean;
}

export interface ISearchUsersResponse {
  data: {
    data: ISearchUserResult[];
    pagination: {
      nextCursor: string | null;
      hasMore: boolean;
    };
  };
  count: number;
  message: string;
}

// Type for the mapped search users page (after mapSearchUserToUser is applied)
export interface ISearchUsersMappedPageData {
  data: {
    data: IUser[];
    pagination: {
      nextCursor: string | null;
      hasMore: boolean;
    };
  };
  count: number;
  message: string;
}

// Search Query Params
export interface ISearchSuggestionsParams {
  query: string;
  username?: string;
}

export interface ISearchPostsParams {
  query: string;
  username?: string;
  cursor?: string;
  limit?: number;
  hasMedia?: boolean;
}

export interface ISearchLatestPostsParams {
  query: string;
  username?: string;
  cursor?: string;
  limit?: number;
}

export interface ISearchUsersParams {
  query: string;
  username?: string;
  cursor?: string;
  limit?: number;
}

// Helper to map search user to IUser
export function mapSearchUserToUser(searchUser: ISearchUserResult): IUser {
  return {
    id: searchUser.userId,
    email: '',
    name: searchUser.name,
    username: searchUser.username,
    bio: searchUser.bio ?? undefined,
    avatarUrl: searchUser.avatarUrl ?? undefined,
    coverUrl: searchUser.coverUrl,
    verified: searchUser.verified,
    followers: searchUser.followers,
    following: searchUser.following,
    isFollowing: searchUser.isFollowing,
    isFollower: searchUser.isFollower,
    isMuted: searchUser.isMuted,
    isBlocked: searchUser.isBlocked,
  };
}

export function mapSuggestedUserToUser(suggestedUser: ISuggestedUser): IUser {
  return {
    id: suggestedUser.userId,
    email: '',
    name: suggestedUser.name,
    username: suggestedUser.username,
    avatarUrl: suggestedUser.avatarUrl ?? undefined,
    isFollowing: suggestedUser.isFollowing,
    isFollower: suggestedUser.isFollower,
  };
}
