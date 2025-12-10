import { PROFILE_QUERY_CONFIG, profileQueryKeys } from '../../config/queryConfig';

describe('queryConfig', () => {
  describe('PROFILE_QUERY_CONFIG', () => {
    it('should have correct userProfile config', () => {
      expect(PROFILE_QUERY_CONFIG.userProfile.staleTime).toBe(5 * 60 * 1000);
      expect(PROFILE_QUERY_CONFIG.userProfile.gcTime).toBe(10 * 60 * 1000);
    });

    it('should have correct tweets config', () => {
      expect(PROFILE_QUERY_CONFIG.tweets.staleTime).toBe(2 * 60 * 1000);
      expect(PROFILE_QUERY_CONFIG.tweets.gcTime).toBe(5 * 60 * 1000);
    });

    it('should have correct socialLists config', () => {
      expect(PROFILE_QUERY_CONFIG.socialLists.staleTime).toBe(3 * 60 * 1000);
      expect(PROFILE_QUERY_CONFIG.socialLists.gcTime).toBe(7 * 60 * 1000);
    });

    it('should have correct pagination config', () => {
      expect(PROFILE_QUERY_CONFIG.pagination.defaultLimit).toBe(20);
      expect(PROFILE_QUERY_CONFIG.pagination.refetchOnWindowFocus).toBe(false);
      expect(PROFILE_QUERY_CONFIG.pagination.refetchOnReconnect).toBe(true);
      expect(PROFILE_QUERY_CONFIG.pagination.maxPages).toBe(5);
    });
  });

  describe('profileQueryKeys', () => {
    it('should generate correct base keys', () => {
      expect(profileQueryKeys.all).toEqual(['profile']);
    });

    it('should generate correct user keys', () => {
      expect(profileQueryKeys.user()).toEqual(['profile', 'user', undefined]);
      expect(profileQueryKeys.user('user-123')).toEqual(['profile', 'user', 'user-123']);
    });

    it('should generate correct userById keys', () => {
      expect(profileQueryKeys.userById('user-123')).toEqual(['profile', 'user', 'user-123', 'details']);
    });

    it('should generate correct tweets keys', () => {
      expect(profileQueryKeys.tweets()).toEqual(['profile', 'tweets', undefined]);
      expect(profileQueryKeys.tweets('user-123')).toEqual(['profile', 'tweets', 'user-123']);
    });

    it('should generate correct userPosts keys', () => {
      expect(profileQueryKeys.userPosts('user-123')).toEqual(['profile', 'tweets', 'user-123', 'posts']);
    });

    it('should generate correct userLikes keys', () => {
      expect(profileQueryKeys.userLikes('user-456')).toEqual(['profile', 'tweets', 'user-456', 'likes']);
    });

    it('should generate correct userMedia keys', () => {
      expect(profileQueryKeys.userMedia('user-789')).toEqual(['profile', 'tweets', 'user-789', 'media']);
    });

    it('should generate correct userReplies keys', () => {
      expect(profileQueryKeys.userReplies('user-999')).toEqual(['profile', 'tweets', 'user-999', 'replies']);
    });

    it('should generate correct social keys', () => {
      expect(profileQueryKeys.social()).toEqual(['profile', 'social', undefined]);
      expect(profileQueryKeys.social('user-123')).toEqual(['profile', 'social', 'user-123']);
    });

    it('should generate correct followers keys', () => {
      expect(profileQueryKeys.followers('user-123')).toEqual(['profile', 'social', 'user-123', 'followers']);
    });

    it('should generate correct following keys', () => {
      expect(profileQueryKeys.following('user-456')).toEqual(['profile', 'social', 'user-456', 'following']);
    });
  });
});
