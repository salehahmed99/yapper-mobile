import api from '@/src/services/apiClient';
import { mapUserDTOToUser } from '@/src/types/user';
import { FetchUserListParams, IUserListResponse, IUserListResponseBackend } from '../types';
import { getMockUserList } from './mockUserListService';

// Set to true to use mock data for testing
const USE_MOCK_DATA = true;

export const getUserList = async (params: FetchUserListParams): Promise<IUserListResponse> => {
  // Use mock data if enabled
  if (USE_MOCK_DATA) {
    return getMockUserList(params);
  }

  const { page, type } = params;

  let endpoint: string;

  if ('tweetId' in params) {
    endpoint = `/tweets/${params.tweetId}/${type}`;
  } else if ('userId' in params) {
    endpoint = `/users/${params.userId}/${type}`;
  } else {
    throw new Error('Invalid parameters: missing tweetId or userId');
  }

  const response = await api.get<IUserListResponseBackend>(endpoint, {
    params: page ? { page } : { page: 1 },
  });

  // Map backend response to frontend format
  return {
    users: response.data.users.map(mapUserDTOToUser),
    nextPage: response.data.nextPage,
  };
};
