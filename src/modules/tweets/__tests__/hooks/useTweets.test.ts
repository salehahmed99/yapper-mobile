import { useInfiniteQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import { useTweets } from '../../hooks/useTweets';
import * as tweetService from '../../services/tweetService';

jest.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: jest.fn(),
}));

jest.mock('../../services/tweetService');

describe('useTweets', () => {
  it('should call useInfiniteQuery with correct params for for-you timeline', () => {
    renderHook(() => useTweets({ limit: 10 }, 'for-you'));

    expect(useInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['tweets', 'for-you', { limit: 10 }],
        queryFn: expect.any(Function),
      }),
    );
  });

  it('should call useInfiniteQuery with correct params for following timeline', () => {
    renderHook(() => useTweets({ limit: 10 }, 'following'));

    expect(useInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['tweets', 'following', { limit: 10 }],
        queryFn: expect.any(Function),
      }),
    );
  });

  it('should call correct service function in queryFn', async () => {
    (useInfiniteQuery as jest.Mock).mockImplementation(({ queryFn }) => {
      queryFn({ pageParam: 'cursor' });
    });

    renderHook(() => useTweets({ limit: 10 }, 'for-you'));
    expect(tweetService.getForYou).toHaveBeenCalledWith({ limit: 10, cursor: 'cursor' });

    renderHook(() => useTweets({ limit: 10 }, 'following'));
    expect(tweetService.getFollowing).toHaveBeenCalledWith({ limit: 10, cursor: 'cursor' });
  });
});
