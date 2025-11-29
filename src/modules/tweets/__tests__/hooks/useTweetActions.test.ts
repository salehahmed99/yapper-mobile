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
  useMutation: ({ mutationFn, onMutate, onSuccess, onError }: any) => {
    return {
      mutate: async (variables: any) => {
        try {
          if (onMutate) await onMutate(variables);
          const result = await mutationFn(variables);
          if (onSuccess) onSuccess(result);
          return result;
        } catch (error) {
          if (onError) onError(error);
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
    const { result } = renderHook(() => useTweetActions(tweetId));

    await waitFor(async () => {
      await result.current.likeMutation.mutate({ tweetId, isLiked: false });
    });

    expect(tweetService.likeTweet).toHaveBeenCalledWith(tweetId);
    expect(mockQueryClient.cancelQueries).toHaveBeenCalledTimes(3);
    expect(mockQueryClient.setQueriesData).toHaveBeenCalledTimes(2);
    expect(mockQueryClient.setQueryData).toHaveBeenCalledTimes(1);
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['profile'] });
  });

  it('should handle unlike mutation', async () => {
    const { result } = renderHook(() => useTweetActions(tweetId));

    await waitFor(async () => {
      await result.current.likeMutation.mutate({ tweetId, isLiked: true });
    });

    expect(tweetService.unlikeTweet).toHaveBeenCalledWith(tweetId);
  });

  it('should handle repost mutation', async () => {
    const { result } = renderHook(() => useTweetActions(tweetId));

    await waitFor(async () => {
      await result.current.repostMutation.mutate({ tweetId, isReposted: false });
    });

    expect(tweetService.repostTweet).toHaveBeenCalledWith(tweetId);
  });

  it('should handle undo repost mutation', async () => {
    const { result } = renderHook(() => useTweetActions(tweetId));

    await waitFor(async () => {
      await result.current.repostMutation.mutate({ tweetId, isReposted: true });
    });

    expect(tweetService.undoRepostTweet).toHaveBeenCalledWith(tweetId);
  });

  it('should handle add post mutation', async () => {
    const { result } = renderHook(() => useTweetActions(tweetId));

    await waitFor(async () => {
      await result.current.addPostMutation.mutate({ content: 'test' });
    });

    expect(tweetService.createTweet).toHaveBeenCalledWith('test', undefined);
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['tweets'] });
  });

  it('should handle reply mutation', async () => {
    const { result } = renderHook(() => useTweetActions(tweetId));

    await waitFor(async () => {
      await result.current.replyToPostMutation.mutate({ content: 'reply' });
    });

    expect(tweetService.replyToTweet).toHaveBeenCalledWith(tweetId, 'reply', undefined);
  });

  it('should handle quote mutation', async () => {
    const { result } = renderHook(() => useTweetActions(tweetId));

    await waitFor(async () => {
      await result.current.quotePostMutation.mutate({ content: 'quote' });
    });

    expect(tweetService.quoteTweet).toHaveBeenCalledWith(tweetId, 'quote', undefined);
  });

  it('should handle delete mutation', async () => {
    const { result } = renderHook(() => useTweetActions(tweetId));

    await waitFor(async () => {
      await result.current.deletePostMutation.mutate(undefined);
    });

    expect(tweetService.deleteTweet).toHaveBeenCalledWith(tweetId);
  });
});
