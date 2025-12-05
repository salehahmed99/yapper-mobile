import { useAuthStore } from '@/src/store/useAuthStore';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Toast from 'react-native-toast-message';
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
  const fetchAndUpdateUser = useAuthStore((state) => state.fetchAndUpdateUser);

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

      setIsFollowing(!variables.isFollowing);

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: ['tweets'] }, (oldData) =>
        updateUserStateInTweetsCache(oldData, variables.userId, toggleFollowState),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: ['profile'] }, (oldData) =>
        updateUserStateInTweetsCache(oldData, variables.userId, toggleFollowState),
      );
    },
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      await fetchAndUpdateUser();

      Toast.show({
        type: 'success',
        text1: variables.isFollowing ? 'Unfollowed' : 'Following',
        text2: variables.isFollowing ? 'You have unfollowed this user' : 'You are now following this user',
        position: 'bottom',
        visibilityTime: 2000,
      });
    },
    onError: (error, variables) => {
      setIsFollowing(variables.isFollowing);

      const errorMessage = error instanceof Error ? error.message : 'Failed to update follow status';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
        position: 'bottom',
        visibilityTime: 3000,
      });

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
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
