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
    // console.log('getMyUser response:', response);
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
    // console.log('Fetching followers list for userId:', userId, 'pageOffset:', pageOffset, 'pageSize:', pageSize, 'following:', following);
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
    // console.log('Fetching following list for userId:', userId, 'pageOffset:', pageOffset, 'pageSize:', pageSize);
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
