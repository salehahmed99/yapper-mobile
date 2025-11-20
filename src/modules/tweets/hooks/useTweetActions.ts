import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { likeTweet, repostTweet, undoRepostTweet, unlikeTweet } from '../services/tweetService';
import { ITweet, ITweets } from '../types';
import { updateTweetsInInfiniteCache } from '../utils/cacheUtils';

interface ILikeMutationVariables {
  isLiked: boolean;
}

interface IRepostMutationVariables {
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
      await queryClient.cancelQueries({ queryKey: tweetDetailsQueryKey });

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: tweetsQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, tweetId, toggleLike),
      );

      queryClient.setQueryData<ITweet>(tweetDetailsQueryKey, (oldData) => (oldData ? toggleLike(oldData) : oldData));
    },
    onError: (error) => {
      console.log('Error updating like status:', error);
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: tweetDetailsQueryKey });
    },
  });

  const repostMutation = useMutation({
    mutationFn: async (variables: IRepostMutationVariables) => {
      return variables.isReposted ? undoRepostTweet(tweetId) : repostTweet(tweetId);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: tweetsQueryKey });
      await queryClient.cancelQueries({ queryKey: tweetDetailsQueryKey });

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: tweetsQueryKey }, (oldData) =>
        updateTweetsInInfiniteCache(oldData, tweetId, toggleRepost),
      );

      queryClient.setQueryData<ITweet>(tweetDetailsQueryKey, (oldData) => (oldData ? toggleRepost(oldData) : oldData));
    },
    onError: (error) => {
      console.log('Error updating repost status:', error);
      queryClient.invalidateQueries({ queryKey: tweetsQueryKey });
      queryClient.invalidateQueries({ queryKey: tweetDetailsQueryKey });
    },
  });
  return { likeMutation, repostMutation };
};
