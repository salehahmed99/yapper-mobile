import api from '@/src/services/apiClient';
import {
  IGetFollowersListParams,
  IGetFollowersListResponse,
  IGetFollowingListParams,
  IGetFollowingListResponse,
  IGetMyUserResponse,
  IGetUserByIdResponse,
  IUserLikesParams,
  IUserLikesResponse,
  IUserMediaParams,
  IUserMediaResponse,
  IUserPostsParams,
  IUserPostsResponse,
  IUserRepliesParams,
  IUserRepliesResponse,
} from '../types';

export const getMyUser = async (): Promise<IGetMyUserResponse> => {
  try {
    const response = await api.get('/users/me');
    return response.data.data;
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
    return response.data.data;
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
  cursor = '',
  limit = 20,
  following = false,
}: IGetFollowersListParams): Promise<IGetFollowersListResponse> => {
  try {
    const response = await api.get(`/users/${userId}/followers`, {
      params: {
        cursor,
        limit,
        following,
      },
    });
    return response.data;
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
  cursor = '',
  limit = 20,
}: IGetFollowingListParams): Promise<IGetFollowingListResponse> => {
  try {
    const response = await api.get(`/users/${userId}/following`, {
      params: {
        cursor,
        limit,
      },
    });
    return response.data;
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

/**
 * Update current user profile
 * @param profileData - The profile data to update
 * @returns Success response
 */
export const updateUserProfile = async (profileData: {
  bio?: string;
  name?: string;
  country?: string;
  birthDate?: string;
  avatar_url?: string | null;
  cover_url?: string | null;
}): Promise<{ message: string }> => {
  try {
    const response = await api.patch('/users/me', profileData);
    return {
      message: response.data.message || 'Updated user successfully',
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred while updating profile.');
    }
    throw error;
  }
};

/**
 * Upload avatar image
 * @param imageUri - Local URI of the image to upload
 * @returns Response with uploaded image URL
 */
export const uploadAvatar = async (imageUri: string): Promise<{ imageUrl: string; imageName: string }> => {
  try {
    const formData = new FormData();

    // Extract filename from URI or use a default
    const filename = imageUri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type,
    } as unknown as Blob);

    const response = await api.post('/users/me/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred while uploading avatar.');
    }
    throw error;
  }
};

/**
 * Upload cover/banner image
 * @param imageUri - Local URI of the image to upload
 * @returns Response with uploaded image URL
 */
export const uploadCover = async (imageUri: string): Promise<{ imageUrl: string; imageName: string }> => {
  try {
    const formData = new FormData();

    // Extract filename from URI or use a default
    const filename = imageUri.split('/').pop() || 'cover.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type,
    } as unknown as Blob);

    const response = await api.post('/users/me/upload-cover', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred while uploading cover.');
    }
    throw error;
  }
};

/**
 * Delete avatar picture and reset to default
 * @param fileUrl - The URL of the avatar file to delete
 * @returns Success response
 */
export const deleteAvatar = async (fileUrl: string): Promise<void> => {
  try {
    await api.delete('/users/me/delete-avatar', {
      data: {
        file_url: fileUrl,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred while deleting avatar.');
    }
    throw error;
  }
};

/**
 * Delete cover picture and reset to default
 * @param fileUrl - The URL of the cover file to delete
 * @returns Success response
 */
export const deleteCover = async (fileUrl: string): Promise<void> => {
  try {
    await api.delete('/users/me/delete-cover', {
      data: {
        file_url: fileUrl,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred while deleting cover.');
    }
    throw error;
  }
};

/**
 * Get user's posts with pagination
 * @param params - Parameters including userId, cursor, and limit
 * @returns User posts response with pagination
 */
export const getUserPosts = async ({ userId, cursor, limit = 20 }: IUserPostsParams): Promise<IUserPostsResponse> => {
  try {
    const params: Record<string, string | number> = { limit };
    if (cursor) {
      params.cursor = cursor;
    }

    const response = await api.get(`/users/${userId}/posts`, { params });
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred while fetching user posts.');
    }
    throw error;
  }
};

/**
 * Get user's media posts with pagination
 * @param params - Parameters including userId, cursor, and limit
 * @returns User media response with pagination
 */
export const getUserMedia = async ({ userId, cursor, limit = 20 }: IUserMediaParams): Promise<IUserMediaResponse> => {
  try {
    const params: Record<string, string | number> = { limit };
    if (cursor) {
      params.cursor = cursor;
    }

    const response = await api.get(`/users/${userId}/media`, { params });
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred while fetching user media.');
    }
    throw error;
  }
};

/**
 * Get user's liked posts with pagination
 * @param params - Parameters including userId, cursor, and limit
 * @returns User likes response with pagination
 */
export const getUserLikes = async ({
  userId: _userId,
  cursor = '',
  limit = 20,
}: IUserLikesParams): Promise<IUserLikesResponse> => {
  try {
    const response = await api.get(`/users/me/liked-posts`, {
      params: {
        cursor,
        limit,
      },
    });
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred while fetching user likes.');
    }
    throw error;
  }
};

/**
 * Get user's replies with pagination
 * @param params - Parameters including userId, cursor, and limit
 * @returns User replies response with pagination
 */
export const getUserReplies = async ({
  userId,
  cursor,
  limit = 20,
}: IUserRepliesParams): Promise<IUserRepliesResponse> => {
  try {
    const params: Record<string, string | number> = { limit };
    if (cursor) {
      params.cursor = cursor;
    }

    const response = await api.get(`/users/${userId}/replies`, { params });
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred while fetching user replies.');
    }
    throw error;
  }
};
