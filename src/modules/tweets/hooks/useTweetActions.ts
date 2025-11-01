import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likeTweet, repostTweet, undoRepostTweet, unlikeTweet } from '../services/tweetService';
import { useTweetsFiltersStore } from '../store/useTweetsFiltersStore';
import { ITweet } from '../types';

interface ILikeMutationVariables {
  tweetId: string;
  isLiked: boolean;
}

interface IRepostMutationVariables {
  tweetId: string;
  isReposted: boolean;
}
export const useTweetActions = () => {
  const queryClient = useQueryClient();
  const tweetsFilters = useTweetsFiltersStore((state) => state.filters);

  const queryKey = ['tweets', tweetsFilters];
  const likeMutation = useMutation({
    mutationFn: async (variables: ILikeMutationVariables) => {
      if (variables.isLiked) {
        return await unlikeTweet(variables.tweetId);
      }
      return await likeTweet(variables.tweetId);
    },
    onMutate: async (variables: ILikeMutationVariables) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTweets = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldData: ITweet[]) => {
        if (!oldData) return oldData;
        return oldData.map((tweet) => {
          if (tweet.tweetId === variables.tweetId) {
            return {
              ...tweet,
              isLiked: !variables.isLiked,
              likesCount: variables.isLiked ? tweet.likesCount - 1 : tweet.likesCount + 1,
            };
          } else {
            return tweet;
          }
        });
      });
      return { previousTweets };
    },
    onError: (error, _, context) => {
      if (context?.previousTweets) queryClient.setQueryData(queryKey, context.previousTweets);
      console.error('Error updating like status:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const repostMutation = useMutation({
    mutationFn: async (variables: IRepostMutationVariables) => {
      if (variables.isReposted) {
        return await undoRepostTweet(variables.tweetId);
      }
      return await repostTweet(variables.tweetId);
    },
    onMutate: async (variables: IRepostMutationVariables) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTweets = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldData: ITweet[]) => {
        if (!oldData) return oldData;
        return oldData.map((tweet) => {
          if (tweet.tweetId === variables.tweetId) {
            return {
              ...tweet,
              isReposted: !variables.isReposted,
              repostsCount: variables.isReposted ? tweet.repostsCount - 1 : tweet.repostsCount + 1,
            };
          } else {
            return tweet;
          }
        });
      });
      return { previousTweets };
    },
    onError: (error, _, context) => {
      if (context?.previousTweets) queryClient.setQueryData(queryKey, context.previousTweets);
      console.error('Error updating repost status:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { likeMutation, repostMutation };
};
