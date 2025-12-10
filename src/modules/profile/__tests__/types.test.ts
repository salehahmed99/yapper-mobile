import type {
  IFollowerUser,
  IFollowersPagination,
  IGetFollowersListParams,
  IGetFollowersListResponse,
  IGetFollowingListParams,
  IGetFollowingListResponse,
  IGetMyUserResponse,
  IGetUserByIdResponse,
  IMutualFollower,
  IUserProfile,
} from '../types';

describe('Profile Types', () => {
  describe('IGetMyUserResponse', () => {
    it('should have correct structure', () => {
      const myUser: IGetMyUserResponse = {
        userId: 'user-1',
        name: 'John Doe',
        username: 'johndoe',
        bio: 'Test bio',
        avatarUrl: 'avatar.jpg',
        coverUrl: 'cover.jpg',
        country: 'US',
        birthDate: '1990-01-01',
        createdAt: '2024-01-01',
        followersCount: 100,
        followingCount: 50,
        email: 'john@example.com',
        language: 'en',
      };

      expect(myUser.userId).toBe('user-1');
      expect(myUser.email).toBe('john@example.com');
    });
  });

  describe('IMutualFollower', () => {
    it('should have correct structure', () => {
      const mutualFollower: IMutualFollower = {
        userId: 'user-2',
        name: 'Jane Doe',
        username: 'janedoe',
        avatarUrl: 'jane.jpg',
      };

      expect(mutualFollower.userId).toBe('user-2');
      expect(mutualFollower.username).toBe('janedoe');
    });
  });

  describe('IUserProfile', () => {
    it('should have correct structure', () => {
      const userProfile: IUserProfile = {
        id: 'user-3',
        name: 'Bob Smith',
        username: 'bobsmith',
        email: 'bob@example.com',
        bio: 'Profile bio',
        avatarUrl: 'bob.jpg',
        coverUrl: null,
        country: null,
        createdAt: '2024-01-01',
        followersCount: 200,
        followingCount: 150,
        isFollower: true,
        isFollowing: false,
        isMuted: false,
        isBlocked: false,
        topMutualFollowers: [],
        mutualFollowersCount: 5,
      };

      expect(userProfile.isFollowing).toBe(false);
      expect(userProfile.mutualFollowersCount).toBe(5);
    });
  });

  describe('IGetUserByIdResponse', () => {
    it('should have correct structure', () => {
      const userById: IGetUserByIdResponse = {
        userId: 'user-4',
        name: 'Alice Johnson',
        username: 'alicej',
        bio: 'User bio',
        avatarUrl: 'alice.jpg',
        coverUrl: 'cover.jpg',
        country: 'UK',
        createdAt: '2023-06-15',
        followersCount: 500,
        followingCount: 300,
        isFollower: false,
        isFollowing: true,
        isMuted: false,
        isBlocked: false,
        topMutualFollowers: [],
        mutualFollowersCount: '10',
      };

      expect(userById.followingCount).toBe(300);
      expect(userById.mutualFollowersCount).toBe('10');
    });
  });

  describe('IFollowerUser', () => {
    it('should have correct structure', () => {
      const followerUser: IFollowerUser = {
        userId: 'user-5',
        name: 'Charlie Brown',
        username: 'charlieb',
        bio: 'Follower bio',
        avatarUrl: 'charlie.jpg',
        isFollowing: true,
        isFollower: true,
        isMuted: false,
        isBlocked: false,
      };

      expect(followerUser.isFollower).toBe(true);
      expect(followerUser.isFollowing).toBe(true);
    });

    it('should allow null bio', () => {
      const followerUser: IFollowerUser = {
        userId: 'user-6',
        name: 'Diana Prince',
        username: 'dianap',
        bio: null,
        avatarUrl: 'diana.jpg',
        isFollowing: false,
        isFollower: true,
        isMuted: false,
        isBlocked: false,
      };

      expect(followerUser.bio).toBeNull();
    });
  });

  describe('IFollowersPagination', () => {
    it('should have correct structure', () => {
      const pagination: IFollowersPagination = {
        nextCursor: 'cursor-123',
        hasMore: true,
      };

      expect(pagination.hasMore).toBe(true);
      expect(pagination.nextCursor).toBe('cursor-123');
    });

    it('should allow null nextCursor', () => {
      const pagination: IFollowersPagination = {
        nextCursor: null,
        hasMore: false,
      };

      expect(pagination.nextCursor).toBeNull();
    });
  });

  describe('IGetFollowersListResponse', () => {
    it('should have correct structure', () => {
      const response: IGetFollowersListResponse = {
        data: {
          data: [],
          pagination: {
            nextCursor: 'abc',
            hasMore: true,
          },
        },
        count: 10,
        message: 'Success',
      };

      expect(response.count).toBe(10);
      expect(response.message).toBe('Success');
    });
  });

  describe('IGetFollowersListParams', () => {
    it('should have correct structure with all params', () => {
      const params: IGetFollowersListParams = {
        userId: 'user-7',
        cursor: 'cursor-xyz',
        limit: 20,
        following: true,
      };

      expect(params.userId).toBe('user-7');
      expect(params.following).toBe(true);
    });

    it('should work with minimal params', () => {
      const params: IGetFollowersListParams = {
        userId: 'user-8',
      };

      expect(params.userId).toBe('user-8');
    });
  });

  describe('IGetFollowingListParams', () => {
    it('should have correct structure with all params', () => {
      const params: IGetFollowingListParams = {
        userId: 'user-9',
        cursor: 'cursor-123',
        limit: 15,
      };

      expect(params.userId).toBe('user-9');
      expect(params.limit).toBe(15);
    });

    it('should work with minimal params', () => {
      const params: IGetFollowingListParams = {
        userId: 'user-10',
      };

      expect(params.userId).toBe('user-10');
    });
  });

  describe('IGetFollowingListResponse', () => {
    it('should have correct structure', () => {
      const response: IGetFollowingListResponse = {
        data: {
          data: [],
          pagination: {
            nextCursor: null,
            hasMore: false,
          },
        },
        count: 25,
        message: 'Fetched successfully',
      };

      expect(response.count).toBe(25);
      expect(response.data.pagination.hasMore).toBe(false);
    });
  });
});
