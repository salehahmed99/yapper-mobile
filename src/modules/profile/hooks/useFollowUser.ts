import { useAuthStore } from '@/src/store/useAuthStore';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ITweet, ITweets } from '../../tweets/types';
import { followUser, unfollowUser } from '../services/profileService';
import { updateUserStateInTweetsCache } from '../utils/profileCacheUtils';

interface UseFollowUserReturn {
  isFollowing: boolean;
  isLoading: boolean;
  toggleFollow: (userId: string) => Promise<void>;
  setIsFollowing: (value: boolean) => void;
}

interface FollowMutationVariables {
  userId: string;
  isFollowing: boolean;
}

export const useFollowUser = (initialFollowState: boolean = false): UseFollowUserReturn => {
  const [isFollowing, setIsFollowing] = useState(initialFollowState);
  const queryClient = useQueryClient();
  const updateFollowCounts = useAuthStore((state) => state.updateFollowCounts);

  const toggleFollowState = (tweet: ITweet) => {
    return {
      ...tweet,
      user: {
        ...tweet.user,
        isFollowing: !tweet.user.isFollowing,
      },
    };
  };

  const followMutation = useMutation({
    mutationFn: async (variables: FollowMutationVariables) => {
      return variables.isFollowing ? unfollowUser(variables.userId) : followUser(variables.userId);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      await queryClient.cancelQueries({ queryKey: ['user', variables.userId] });
      await queryClient.cancelQueries({ queryKey: ['tweets'] });
      await queryClient.cancelQueries({ queryKey: ['followers'] });
      await queryClient.cancelQueries({ queryKey: ['following'] });

      setIsFollowing(!variables.isFollowing);

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: ['tweets'] }, (oldData) =>
        updateUserStateInTweetsCache(oldData, variables.userId, toggleFollowState),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: ['profile'] }, (oldData) =>
        updateUserStateInTweetsCache(oldData, variables.userId, toggleFollowState),
      );
    },
    onSuccess: async (data, variables) => {
      // Update own following count optimistically
      updateFollowCounts(!variables.isFollowing);

      await queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      await queryClient.invalidateQueries({ queryKey: ['followers'] });
      await queryClient.invalidateQueries({ queryKey: ['following'] });
      await queryClient.invalidateQueries({ queryKey: ['userList'] });
    },
    onError: (error, variables) => {
      setIsFollowing(variables.isFollowing);

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['userList'] });
    },
  });

  const toggleFollow = async (userId: string) => {
    if (followMutation.isPending || !userId) return;
    await followMutation.mutateAsync({ userId, isFollowing });
  };

  return {
    isFollowing,
    isLoading: followMutation.isPending,
    toggleFollow,
    setIsFollowing,
  };
};
