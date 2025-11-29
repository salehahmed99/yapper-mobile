import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTweet,
  deleteTweet,
  likeTweet,
  quoteTweet,
  replyToTweet,
  repostTweet,
  undoRepostTweet,
  unlikeTweet,
} from '../services/tweetService';
import { ITweet, ITweets } from '../types';
import { updateTweetsInInfiniteCache } from '../utils/cacheUtils';

interface ILikeMutationVariables {
  tweetId: string;
  isLiked: boolean;
}

interface IRepostMutationVariables {
  tweetId: string;
  isReposted: boolean;
}
export const useTweetActions = (tweetId: string) => {
  const queryClient = useQueryClient();

  const tweetsQueryKey = ['tweets'];
  const tweetDetailsQueryKey = ['tweet', { tweetId }];

  const toggleLike = (tweet: ITweet) => {
    return {
      ...tweet,
      isLiked: !tweet.isLiked,
      likesCount: tweet.isLiked ? tweet.likesCount - 1 : tweet.likesCount + 1,
    };
  };

  const toggleRepost = (tweet: ITweet) => {
    return {
      ...tweet,
      isReposted: !tweet.isReposted,
      repostsCount: tweet.isReposted ? tweet.repostsCount - 1 : tweet.repostsCount + 1,
    };
  };

  const likeMutation = useMutation({
    mutationFn: async (variables: ILikeMutationVariables) => {
      return variables.isLiked ? unlikeTweet(tweetId) : likeTweet(tweetId);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: tweetsQueryKey });
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      await queryClient.cancelQueries({ queryKey: tweetDetailsQueryKey });

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: tweetsQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, tweetId, toggleLike),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: ['profile'] }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, tweetId, toggleLike),
      );

      queryClient.setQueryData<ITweet>(tweetDetailsQueryKey, (oldData) => (oldData ? toggleLike(oldData) : oldData));
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },

    onError: (error) => {
      console.log('Error updating like status:', error);
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: tweetDetailsQueryKey });
    },
  });

  const repostMutation = useMutation({
    mutationFn: async (variables: IRepostMutationVariables) => {
      return variables.isReposted ? undoRepostTweet(tweetId) : repostTweet(tweetId);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: tweetsQueryKey });
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      await queryClient.cancelQueries({ queryKey: tweetDetailsQueryKey });

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: tweetsQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, tweetId, toggleRepost),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: ['profile'] }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, tweetId, toggleRepost),
      );

      queryClient.setQueryData<ITweet>(tweetDetailsQueryKey, (oldData) => (oldData ? toggleRepost(oldData) : oldData));
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },

    onError: (error) => {
      console.log('Error updating repost status:', error);

      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: tweetDetailsQueryKey });
    },
  });

  const addPostMutation = useMutation({
    mutationFn: async ({ content, mediaUris }: { content: string; mediaUris?: string[] }) => {
      return createTweet(content, mediaUris);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      // Error creating tweet
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const replyToPostMutation = useMutation({
    mutationFn: async ({ content, mediaUris }: { content: string; mediaUris?: string[] }) => {
      return replyToTweet(tweetId, content, mediaUris);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      // Error replying to tweet
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const quotePostMutation = useMutation({
    mutationFn: async ({ content, mediaUris }: { content: string; mediaUris?: string[] }) => {
      return quoteTweet(tweetId, content, mediaUris);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      // Error quoting tweet
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async () => {
      // Implement delete tweet functionality here
      return deleteTweet(tweetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      // Error deleting tweet
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return { likeMutation, repostMutation, addPostMutation, replyToPostMutation, quotePostMutation, deletePostMutation };
};
