import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import { useTweet } from '../../hooks/useTweet';
import * as tweetService from '../../services/tweetService';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('../../services/tweetService');

describe('useTweet', () => {
  it('should call useQuery with correct params', () => {
    renderHook(() => useTweet('123'));

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['tweet', { tweetId: '123' }],
        queryFn: expect.any(Function),
        enabled: true,
      }),
    );
  });

  it('should call getTweetById in queryFn', () => {
    (useQuery as jest.Mock).mockImplementation(({ queryFn }) => {
      queryFn();
    });

    renderHook(() => useTweet('123'));
    expect(tweetService.getTweetById).toHaveBeenCalledWith('123');
  });
});
