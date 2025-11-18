import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
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

  // Track pending mutations per tweet
  const pendingLikes = useRef<Set<string>>(new Set());
  const pendingReposts = useRef<Set<string>>(new Set());

  const queryKey = ['tweets', tweetsFilters];
  const likeMutation = useMutation({
    mutationFn: async (variables: ILikeMutationVariables) => {
      // Prevent duplicate requests for the same tweet
      if (pendingLikes.current.has(variables.tweetId)) {
        return;
      }

      pendingLikes.current.add(variables.tweetId);
      try {
        if (variables.isLiked) {
          return await unlikeTweet(variables.tweetId);
        }
        return await likeTweet(variables.tweetId);
      } finally {
        pendingLikes.current.delete(variables.tweetId);
      }
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
      console.log('Error updating like status:', error);
    },
  });

  const repostMutation = useMutation({
    mutationFn: async (variables: IRepostMutationVariables) => {
      // Prevent duplicate requests for the same tweet
      if (pendingReposts.current.has(variables.tweetId)) {
        return;
      }

      pendingReposts.current.add(variables.tweetId);
      try {
        if (variables.isReposted) {
          return await undoRepostTweet(variables.tweetId);
        }
        return await repostTweet(variables.tweetId);
      } finally {
        pendingReposts.current.delete(variables.tweetId);
      }
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
      console.log('Error updating repost status:', error);
    },
  });

  return { likeMutation, repostMutation };
};
