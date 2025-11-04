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
  id: follower.id,
  name: follower.name,
  username: follower.username,
  bio: follower.bio,
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
      pageOffset: page || 1,
      pageSize: 20,
      following: false,
    });

    return {
      users: response.data.map(mapFollowerUserToUser),
      nextPage: response.data.length === 20 ? (page || 1) + 1 : null,
    };
  }

  // Use the following endpoint
  if (type === 'following' && 'userId' in params) {
    const response = await getFollowingList({
      userId: params.userId,
      pageOffset: page || 1,
      pageSize: 20,
    });

    return {
      users: response.data.map(mapFollowerUserToUser),
      nextPage: response.data.length === 20 ? (page || 1) + 1 : null,
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
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || t('userList.errors.fetchFailed') || 'An error occurred while fetching users.',
    );
  }
};
