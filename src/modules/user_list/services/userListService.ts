import api from '@/src/services/apiClient';
import { IUser, mapUserDTOToUser } from '@/src/types/user';
import { t } from 'i18next';
import { getFollowersList, getFollowingList } from '../../profile/services/profileService';
import { IFollowerUser } from '../../profile/types';
import { FetchUserListParams, IUserListResponse, IUserListResponseBackend } from '../types';
import { getMockUserList } from './mockUserListService';

// Set to true to use mock data for testing
const USE_MOCK_DATA = false;

/**
 * Helper function to convert IFollowerUser to IUser
 */
const mapFollowerUserToUser = (follower: IFollowerUser): IUser => ({
  id: follower.userId,
  name: follower.name,
  username: follower.username,
  bio: follower.bio ?? undefined,
  avatarUrl: follower.avatarUrl,
  email: '', // Not provided in followers endpoint
  isFollowing: follower.isFollowing,
  isFollower: follower.isFollower,
  isMuted: follower.isMuted,
  isBlocked: follower.isBlocked,
});

export const getUserList = async (params: FetchUserListParams): Promise<IUserListResponse> => {
  // Use mock data if enabled
  if (USE_MOCK_DATA) {
    return getMockUserList(params);
  }

  const { page, type } = params;

  // Use the followers endpoint
  if (type === 'followers' && 'userId' in params) {
    const response = await getFollowersList({
      userId: params.userId,
      cursor: params.cursor || '',
      limit: 20,
      following: false,
    });

    return {
      users: response.data.data.map(mapFollowerUserToUser),
      nextCursor: response.data.pagination.nextCursor,
      hasMore: response.data.pagination.hasMore,
    };
  }

  // Use the following endpoint
  if (type === 'following' && 'userId' in params) {
    const response = await getFollowingList({
      userId: params.userId,
      cursor: params.cursor || '',
      limit: 20,
    });

    return {
      users: response.data.data.map(mapFollowerUserToUser),
      nextCursor: response.data.pagination.nextCursor,
      hasMore: response.data.pagination.hasMore,
    };
  }

  let endpoint: string;

  if ('tweetId' in params) {
    endpoint = `/tweets/${params.tweetId}/${type}`;
  } else if ('userId' in params) {
    endpoint = `/users/${params.userId}/${type}`;
  } else {
    throw new Error('Invalid parameters: missing tweetId or userId');
  }
  try {
    const response = await api.get<IUserListResponseBackend>(endpoint, {
      params: page ? { page } : { page: 1 },
    });
    // Map backend response to frontend format
    return {
      users: response.data.data.data.map(mapUserDTOToUser),
      nextPage: response.data.data.pagination.has_next_page ? response.data.data.pagination.current_page + 1 : null,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
    throw new Error(errorMessage || t('userList.errors.fetchFailed') || 'An error occurred while fetching users.');
  }
};
