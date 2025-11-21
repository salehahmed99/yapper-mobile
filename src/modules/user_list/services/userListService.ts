import api from '@/src/services/apiClient';
import { IUser, mapUserDTOToUser } from '@/src/types/user';
import { t } from 'i18next';
import { getFollowersList, getFollowingList } from '../../profile/services/profileService';
import { IFollowerUser } from '../../profile/types';
import { FetchUserListParams, IUserListResponse, IUserListResponseBackend } from '../types';

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
  const { type, cursor, limit = 20 } = params;

  // Use the followers endpoint
  if (type === 'followers' && 'userId' in params) {
    const response = await getFollowersList({
      userId: params.userId,
      pageOffset: 1,
      pageSize: limit,
      following: false,
    });

    return {
      users: response.data.map(mapFollowerUserToUser),
      hasMore: response.data.length === limit,
      nextCursor: response.data.length === limit ? response.data[response.data.length - 1].userId : undefined,
    };
  }

  // Use the following endpoint
  if (type === 'following' && 'userId' in params) {
    const response = await getFollowingList({
      userId: params.userId,
      pageOffset: 1,
      pageSize: limit,
    });

    return {
      users: response.data.map(mapFollowerUserToUser),
      hasMore: response.data.length === limit,
      nextCursor: response.data.length === limit ? response.data[response.data.length - 1].userId : undefined,
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
      params: {
        limit,
        ...(cursor && { cursor }),
      },
    });
    // Map backend response to frontend format
    return {
      users: response.data.data.data.map(mapUserDTOToUser),
      hasMore: response.data.data.has_more,
      nextCursor: response.data.data.next_cursor,
    };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || t('userList.errors.fetchFailed') || 'An error occurred while fetching users.',
    );
  }
};
