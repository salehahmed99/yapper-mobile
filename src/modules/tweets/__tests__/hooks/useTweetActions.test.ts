import { renderHook, waitFor } from '@testing-library/react-native';
import { useTweetActions } from '../../hooks/useTweetActions';
import * as tweetService from '../../services/tweetService';

// Mock react-query
const mockQueryClient = {
  cancelQueries: jest.fn(),
  setQueriesData: jest.fn(),
  setQueryData: jest.fn(),
  invalidateQueries: jest.fn(),
};

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => mockQueryClient,
  useMutation: ({ mutationFn, onMutate, onSuccess, onError, onSettled }: any) => {
    return {
      mutate: async (variables: any) => {
        try {
          if (onMutate) await onMutate(variables);
          const result = await mutationFn(variables);
          if (onSuccess) onSuccess(result, variables);
          if (onSettled) onSettled(result, null, variables);
          return result;
        } catch (error) {
          if (onError) onError(error, variables);
          if (onSettled) onSettled(undefined, error, variables);
        }
      },
    };
  },
}));

jest.mock('../../services/tweetService');

describe('useTweetActions', () => {
  const tweetId = '123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle like mutation', async () => {
    const { result } = renderHook(() => useTweetActions());

    await waitFor(async () => {
      await result.current.likeMutation.mutate({ tweetId, isLiked: false });
    });

    expect(tweetService.likeTweet).toHaveBeenCalledWith(tweetId);
    // Implementation calls cancelQueries 7 times for various keys
    expect(mockQueryClient.cancelQueries).toHaveBeenCalledTimes(7);
    // Implementation calls setQueriesData 6 times (tweets, profile lists, replies, search, explore, category)
    expect(mockQueryClient.setQueriesData).toHaveBeenCalledTimes(6);
    expect(mockQueryClient.setQueryData).toHaveBeenCalledTimes(1);
    // Invalidate profile likes (1) + onSuccess invalidates userList likes (1)
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledTimes(2);
  });

  it('should handle unlike mutation', async () => {
    const { result } = renderHook(() => useTweetActions());

    await waitFor(async () => {
      await result.current.likeMutation.mutate({ tweetId, isLiked: true });
    });

    expect(tweetService.unlikeTweet).toHaveBeenCalledWith(tweetId);
  });

  it('should handle repost mutation', async () => {
    const { result } = renderHook(() => useTweetActions());

    await waitFor(async () => {
      await result.current.repostMutation.mutate({ tweetId, isReposted: false });
    });

    expect(tweetService.repostTweet).toHaveBeenCalledWith(tweetId);
  });

  it('should handle undo repost mutation', async () => {
    const { result } = renderHook(() => useTweetActions());

    await waitFor(async () => {
      await result.current.repostMutation.mutate({ tweetId, isReposted: true });
    });

    expect(tweetService.undoRepostTweet).toHaveBeenCalledWith(tweetId);
  });

  it('should handle add post mutation', async () => {
    const { result } = renderHook(() => useTweetActions());

    await waitFor(async () => {
      await result.current.addPostMutation.mutate({ content: 'test' });
    });

    expect(tweetService.createTweet).toHaveBeenCalledWith('test', undefined);
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['tweets'] });
  });

  it('should handle reply mutation', async () => {
    const { result } = renderHook(() => useTweetActions());

    await waitFor(async () => {
      await result.current.replyToPostMutation.mutate({ tweetId, content: 'reply' });
    });

    expect(tweetService.replyToTweet).toHaveBeenCalledWith(tweetId, 'reply', undefined);
  });

  it('should handle quote mutation', async () => {
    const { result } = renderHook(() => useTweetActions());

    await waitFor(async () => {
      await result.current.quotePostMutation.mutate({ tweetId, content: 'quote' });
    });

    expect(tweetService.quoteTweet).toHaveBeenCalledWith(tweetId, 'quote', undefined);
  });

  it('should handle delete mutation', async () => {
    const { result } = renderHook(() => useTweetActions());

    await waitFor(async () => {
      await result.current.deletePostMutation.mutate({ tweetId });
    });

    expect(tweetService.deleteTweet).toHaveBeenCalledWith(tweetId);
  });
});
