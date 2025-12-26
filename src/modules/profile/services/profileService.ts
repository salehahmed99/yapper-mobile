import api from '@/src/services/apiClient';
import {
  IGetFollowersListParams,
  IGetFollowersListResponse,
  IGetFollowingListParams,
  IGetFollowingListResponse,
  IGetMyUserResponse,
  IGetUserByIdResponse,
  IGetUserByUsernameResponse,
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

export const getUserByUsername = async (username: string): Promise<IGetUserByIdResponse> => {
  try {
    const response = await api.get<IGetUserByUsernameResponse>(`/users/by/username/${username}`);
    const userData = response.data.data;

    // Map the response to IGetUserByIdResponse format
    return {
      userId: userData.userId,
      name: userData.name,
      username: userData.username,
      bio: userData.bio,
      avatarUrl: userData.avatarUrl,
      coverUrl: userData.coverUrl,
      country: userData.country,
      createdAt: userData.createdAt,
      followersCount: userData.followersCount,
      followingCount: userData.followingCount,
      isFollower: userData.isFollower,
      isFollowing: userData.isFollowing,
      isMuted: userData.isMuted,
      isBlocked: userData.isBlocked,
      topMutualFollowers: userData.topMutualFollowers.map((f) => ({
        userId: '',
        name: f.name,
        username: '',
        avatarUrl: f.avatarUrl || '',
      })),
      mutualFollowersCount: userData.mutualFollowersCount,
    };
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

export const getMutualFollowers = async ({
  userId,
  cursor = '',
  limit = 20,
  following = true,
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

export const getMutedList = async ({
  cursor = '',
  limit = 20,
}: IGetFollowersListParams): Promise<IGetFollowersListResponse> => {
  try {
    const response = await api.get('/users/me/muted', {
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
      throw new Error(error.response.data.message || 'An error occurred while fetching muted list.');
    }
    throw error;
  }
};

export const getBlockedList = async ({
  cursor = '',
  limit = 20,
}: IGetFollowersListParams): Promise<IGetFollowersListResponse> => {
  try {
    const response = await api.get('/users/me/blocked', {
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
      throw new Error(error.response.data.message || 'An error occurred while fetching blocked list.');
    }
    throw error;
  }
};

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

export const uploadAvatar = async (imageUri: string): Promise<{ imageUrl: string; imageName: string }> => {
  try {
    const formData = new FormData();
    let filename = imageUri.split('/').pop() || 'avatar.jpg';

    // Convert HEIC to JPEG filename and type
    if (filename.toLowerCase().endsWith('.heic') || filename.toLowerCase().endsWith('.heif')) {
      filename = filename.replace(/\.(heic|heif)$/i, '.jpg');
    }

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: 'image/jpeg',
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

export const uploadCover = async (imageUri: string): Promise<{ imageUrl: string; imageName: string }> => {
  try {
    const formData = new FormData();

    let filename = imageUri.split('/').pop() || 'cover.jpg';

    // Convert HEIC to JPEG filename and type
    if (filename.toLowerCase().endsWith('.heic') || filename.toLowerCase().endsWith('.heif')) {
      filename = filename.replace(/\.(heic|heif)$/i, '.jpg');
    }

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: 'image/jpeg',
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

export const getUserPosts = async ({ userId, cursor, limit = 20 }: IUserPostsParams): Promise<IUserPostsResponse> => {
  try {
    const params: Record<string, string | number> = { limit };
    if (cursor) {
      params.cursor = cursor;
    }

    const response = await api.get(`/users/${userId}/posts`, { params });
    return response.data.data;
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

export const getUserMedia = async ({ userId, cursor, limit = 20 }: IUserMediaParams): Promise<IUserMediaResponse> => {
  try {
    const params: Record<string, string | number> = { limit };
    if (cursor) {
      params.cursor = cursor;
    }

    const response = await api.get(`/users/${userId}/media`, { params });
    return response.data.data;
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
    return response.data.data;
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
    return response.data.data;
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

export const getUserRelations = async (): Promise<{ blockedCount: number; mutedCount: number }> => {
  try {
    const response = await api.get('/users/me/relations-count');
    return response.data.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred while fetching user relations.');
    }
    throw error;
  }
};
