import api from '@/src/services/apiClient';
import {
  IGetFollowersListParams,
  IGetFollowersListResponse,
  IGetFollowingListParams,
  IGetFollowingListResponse,
  IGetMyUserResponse,
  IGetUserByIdResponse,
  mapGetFollowersListResponseDTOToResponse,
  mapGetFollowingListResponseDTOToResponse,
  mapGetMyUserResponseDTOToResponse,
  mapGetUserByIdResponseDTOToResponse,
} from '../types';

export const getMyUser = async (): Promise<IGetMyUserResponse> => {
  try {
    const response = await api.get('/users/me');
    return mapGetMyUserResponseDTOToResponse(response.data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred while fetching user data.');
    }
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<IGetUserByIdResponse> => {
  try {
    const response = await api.get(`/users/${userId}`);
    return mapGetUserByIdResponseDTOToResponse(response.data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred while fetching user data.');
    }
    throw error;
  }
};

export const getFollowersList = async ({
  userId,
  pageOffset = 1,
  pageSize = 20,
  following = false,
}: IGetFollowersListParams): Promise<IGetFollowersListResponse> => {
  try {
    const response = await api.get(`/users/${userId}/followers`, {
      params: {
        page_offset: pageOffset,
        page_size: pageSize,
        following,
      },
    });
    return mapGetFollowersListResponseDTOToResponse(response.data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred while fetching followers list.');
    }
    throw error;
  }
};

export const getFollowingList = async ({
  userId,
  pageOffset = 1,
  pageSize = 20,
}: IGetFollowingListParams): Promise<IGetFollowingListResponse> => {
  try {
    const response = await api.get(`/users/${userId}/following`, {
      params: {
        page_offset: pageOffset,
        page_size: pageSize,
      },
    });
    return mapGetFollowingListResponseDTOToResponse(response.data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred while fetching following list.');
    }
    throw error;
  }
};

/**
 * Mute a user by their ID
 * @param userId - The ID of the user to mute
 * @returns Success response
 */
export const muteUser = async (userId: string): Promise<{ message: string }> => {
  try {
    const response = await api.post(`/users/${userId}/mute`);
    return {
      message: response.data.message || 'User muted successfully',
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred while muting user.');
    }
    throw error;
  }
};

/**
 * Unmute a user by their ID
 * @param userId - The ID of the user to unmute
 * @returns Success response
 */
export const unmuteUser = async (userId: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/users/${userId}/unmute`);
    return {
      message: response.data.message || 'User unmuted successfully',
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred while unmuting user.');
    }
    throw error;
  }
};

/**
 * Follow a user by their ID
 * @param userId - The ID of the user to follow
 * @returns Success response with follow count
 */
export const followUser = async (userId: string): Promise<{ count: number; message: string }> => {
  try {
    const response = await api.post(`/users/${userId}/follow`);
    return {
      count: response.data.count || 0,
      message: response.data.message || 'Followed user successfully',
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred while following user.');
    }
    throw error;
  }
};

/**
 * Unfollow a user by their ID
 * @param userId - The ID of the user to unfollow
 * @returns Success response
 */
export const unfollowUser = async (userId: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/users/${userId}/unfollow`);
    return {
      message: response.data.message || 'Unfollowed user successfully',
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred while unfollowing user.');
    }
    throw error;
  }
};

/**
 * Block a user by their ID
 * @param userId - The ID of the user to block
 * @returns Success response
 */
export const blockUser = async (userId: string): Promise<{ message: string }> => {
  try {
    const response = await api.post(`/users/${userId}/block`);
    return {
      message: response.data.message || 'Blocked user successfully',
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred while blocking user.');
    }
    throw error;
  }
};

/**
 * Unblock a user by their ID
 * @param userId - The ID of the user to unblock
 * @returns Success response
 */
export const unblockUser = async (userId: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/users/${userId}/unblock`);
    return {
      message: response.data.message || 'Unblocked user successfully',
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred while unblocking user.');
    }
    throw error;
  }
};
