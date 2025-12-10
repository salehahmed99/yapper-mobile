import { ISearchUserResult, ISuggestedUser, mapSearchUserToUser, mapSuggestedUserToUser } from '../../types';

describe('Search Types Helpers', () => {
  describe('mapSearchUserToUser', () => {
    it('should map all fields from ISearchUserResult to IUser', () => {
      const searchUser: ISearchUserResult = {
        userId: '123',
        name: 'John Doe',
        username: 'johndoe',
        bio: 'Developer and tech enthusiast',
        avatarUrl: 'https://example.com/avatar.jpg',
        coverUrl: 'https://example.com/cover.jpg',
        verified: true,
        followers: 1000,
        following: 200,
        isFollowing: true,
        isFollower: false,
        isMuted: false,
        isBlocked: false,
      };

      const result = mapSearchUserToUser(searchUser);

      expect(result).toEqual({
        id: '123',
        email: '',
        name: 'John Doe',
        username: 'johndoe',
        bio: 'Developer and tech enthusiast',
        avatarUrl: 'https://example.com/avatar.jpg',
        coverUrl: 'https://example.com/cover.jpg',
        verified: true,
        followers: 1000,
        following: 200,
        isFollowing: true,
        isFollower: false,
        isMuted: false,
        isBlocked: false,
      });
    });

    it('should handle null bio and avatarUrl', () => {
      const searchUser: ISearchUserResult = {
        userId: '456',
        name: 'Jane',
        username: 'jane',
        bio: null,
        avatarUrl: null,
        coverUrl: null,
        verified: false,
        followers: 50,
        following: 30,
        isFollowing: false,
        isFollower: true,
        isMuted: true,
        isBlocked: true,
      };

      const result = mapSearchUserToUser(searchUser);

      expect(result.bio).toBeUndefined();
      expect(result.avatarUrl).toBeUndefined();
      expect(result.coverUrl).toBeNull();
      expect(result.isMuted).toBe(true);
      expect(result.isBlocked).toBe(true);
    });
  });

  describe('mapSuggestedUserToUser', () => {
    it('should map all fields from ISuggestedUser to IUser', () => {
      const suggestedUser: ISuggestedUser = {
        userId: '789',
        name: 'Suggested User',
        username: 'suggested',
        avatarUrl: 'https://example.com/avatar.png',
        isFollowing: false,
        isFollower: true,
      };

      const result = mapSuggestedUserToUser(suggestedUser);

      expect(result).toEqual({
        id: '789',
        email: '',
        name: 'Suggested User',
        username: 'suggested',
        avatarUrl: 'https://example.com/avatar.png',
        isFollowing: false,
        isFollower: true,
      });
    });

    it('should handle null avatarUrl', () => {
      const suggestedUser: ISuggestedUser = {
        userId: '101',
        name: 'No Avatar',
        username: 'noavatar',
        avatarUrl: null,
        isFollowing: true,
        isFollower: false,
      };

      const result = mapSuggestedUserToUser(suggestedUser);

      expect(result.avatarUrl).toBeUndefined();
      expect(result.isFollowing).toBe(true);
    });
  });
});
