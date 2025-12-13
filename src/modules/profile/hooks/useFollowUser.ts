import { useAuthStore } from '@/src/store/useAuthStore';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { IExploreResponse, IWhoToFollowResponse } from '../../explore/types';
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

  // Helper to update whoToFollow in explore cache
  const updateExploreWhoToFollow = (
    oldData: IExploreResponse | undefined,
    userId: string,
    newFollowingState: boolean,
  ): IExploreResponse | undefined => {
    if (!oldData?.data?.whoToFollow) return oldData;

    return {
      ...oldData,
      data: {
        ...oldData.data,
        whoToFollow: oldData.data.whoToFollow.map((user) =>
          user.id === userId ? { ...user, isFollowing: newFollowingState } : user,
        ),
      },
    };
  };

  // Helper to update whoToFollow dedicated cache
  const updateWhoToFollowCache = (
    oldData: IWhoToFollowResponse | undefined,
    userId: string,
    newFollowingState: boolean,
  ): IWhoToFollowResponse | undefined => {
    if (!oldData?.data) return oldData;

    return {
      ...oldData,
      data: oldData.data.map((user) => (user.id === userId ? { ...user, isFollowing: newFollowingState } : user)),
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
      await queryClient.cancelQueries({ queryKey: ['explore', 'forYou'] });
      await queryClient.cancelQueries({ queryKey: ['whoToFollow'] });

      setIsFollowing(!variables.isFollowing);

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: ['tweets'] }, (oldData) =>
        updateUserStateInTweetsCache(oldData, variables.userId, toggleFollowState),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: ['profile'] }, (oldData) =>
        updateUserStateInTweetsCache(oldData, variables.userId, toggleFollowState),
      );

      // Update explore cache (whoToFollow section in ForYou tab)
      queryClient.setQueryData<IExploreResponse>(['explore', 'forYou'], (oldData) =>
        updateExploreWhoToFollow(oldData, variables.userId, !variables.isFollowing),
      );

      // Update dedicated whoToFollow cache (Show more screen)
      queryClient.setQueriesData<IWhoToFollowResponse>({ queryKey: ['whoToFollow'] }, (oldData) =>
        updateWhoToFollowCache(oldData, variables.userId, !variables.isFollowing),
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
      queryClient.invalidateQueries({ queryKey: ['explore', 'forYou'] });
      queryClient.invalidateQueries({ queryKey: ['whoToFollow'] });
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
