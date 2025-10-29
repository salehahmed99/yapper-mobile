import { IUser } from '@/src/types/user';
import { FetchUserListParams, IUserListResponse } from '../types';

// Generate mock users
const generateMockUsers = (page: number, pageSize: number = 20): IUser[] => {
  const startIndex = (page - 1) * pageSize;
  const users: IUser[] = [];

  for (let i = 0; i < pageSize; i++) {
    const index = startIndex + i + 1;
    users.push({
      id: `user-${index}`,
      name: `User ${index}`,
      username: `user${index}`,
      email: `user${index}@example.com`,
      avatarUrl: `https://i.pravatar.cc/150?img=${index}`,
      bio: `This is a bio for user ${index}. Just a mock user for testing purposes.`,
      isFollowing: Math.random() > 0.5,
      isFollower: Math.random() > 0.7,
    });
  }

  return users;
};

export const getMockUserList = async (params: FetchUserListParams): Promise<IUserListResponse> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const page = params.page || 1;
  const pageSize = 20;
  const totalPages = 5; // Total 100 mock users across 5 pages

  const users = generateMockUsers(page, pageSize);

  return {
    users,
    nextPage: page < totalPages ? page + 1 : null,
  };
};
