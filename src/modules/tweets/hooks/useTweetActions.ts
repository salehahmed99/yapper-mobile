import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likeTweet, repostTweet, undoRepostTweet, unlikeTweet } from '../services/tweetService';
import { useTweetsFiltersStore } from '../store/useTweetsFiltersStore';
import { ITweet } from '../types';

interface ILikeMutationVariables {
  tweet_id: string;
  is_liked: boolean;
}

interface IRepostMutationVariables {
  tweet_id: string;
  is_reposted: boolean;
}
export const useTweetActions = () => {
  const queryClient = useQueryClient();
  const tweetsFilters = useTweetsFiltersStore((state) => state.filters);

  const queryKey = ['tweets', tweetsFilters];
  const likeMutation = useMutation({
    mutationFn: async (variables: ILikeMutationVariables) => {
      if (variables.is_liked) {
        return await unlikeTweet(variables.tweet_id);
      }
      return await likeTweet(variables.tweet_id);
    },
    onMutate: async (variables: ILikeMutationVariables) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTweets = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldData: ITweet[]) => {
        if (!oldData) return oldData;
        return oldData.map((tweet) => {
          if (tweet.tweet_id === variables.tweet_id) {
            return {
              ...tweet,
              is_liked: !variables.is_liked,
              likes_count: variables.is_liked ? tweet.likes_count - 1 : tweet.likes_count + 1,
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
      if (variables.is_reposted) {
        return await undoRepostTweet(variables.tweet_id);
      }
      return await repostTweet(variables.tweet_id);
    },
    onMutate: async (variables: IRepostMutationVariables) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTweets = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldData: ITweet[]) => {
        if (!oldData) return oldData;
        return oldData.map((tweet) => {
          if (tweet.tweet_id === variables.tweet_id) {
            return {
              ...tweet,
              is_reposted: !variables.is_reposted,
              reposts_count: variables.is_reposted ? tweet.reposts_count - 1 : tweet.reposts_count + 1,
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
