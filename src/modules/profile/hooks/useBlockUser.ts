import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { IExploreResponse, IWhoToFollowResponse } from '../../explore/types';
import { ITweet, ITweets } from '../../tweets/types';
import { blockUser, unblockUser } from '../services/profileService';
import { updateUserStateInTweetsCache } from '../utils/profileCacheUtils';

interface BlockMutationVariables {
  userId: string;
  isBlocked: boolean;
}

export const useBlockUser = (initialBlockState: boolean = false) => {
  const [isBlocked, setIsBlocked] = useState(initialBlockState);
  const queryClient = useQueryClient();

  const toggleBlockState = (tweet: ITweet) => {
    return {
      ...tweet,
      user: {
        ...tweet.user,
        isBlocked: !tweet.user.isBlocked,
      },
    };
  };

  // Helper to remove user from whoToFollow in explore cache
  const removeFromExploreWhoToFollow = (
    oldData: IExploreResponse | undefined,
    userId: string,
  ): IExploreResponse | undefined => {
    if (!oldData?.data?.whoToFollow) return oldData;

    return {
      ...oldData,
      data: {
        ...oldData.data,
        whoToFollow: oldData.data.whoToFollow.filter((user) => user.id !== userId),
      },
    };
  };

  // Helper to remove user from dedicated whoToFollow cache
  const removeFromWhoToFollowCache = (
    oldData: IWhoToFollowResponse | undefined,
    userId: string,
  ): IWhoToFollowResponse | undefined => {
    if (!oldData?.data) return oldData;

    return {
      ...oldData,
      data: oldData.data.filter((user) => user.id !== userId),
    };
  };

  const blockMutation = useMutation({
    mutationFn: async (variables: BlockMutationVariables) => {
      return variables.isBlocked ? unblockUser(variables.userId) : blockUser(variables.userId);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      await queryClient.cancelQueries({ queryKey: ['user', variables.userId] });
      await queryClient.cancelQueries({ queryKey: ['tweets'] });
      await queryClient.cancelQueries({ queryKey: ['explore', 'forYou'] });
      await queryClient.cancelQueries({ queryKey: ['whoToFollow'] });

      setIsBlocked(!variables.isBlocked);

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: ['tweets'] }, (oldData) =>
        updateUserStateInTweetsCache(oldData, variables.userId, toggleBlockState),
      );

      queryClient.setQueriesData<InfiniteData<ITweets>>({ queryKey: ['profile'] }, (oldData) =>
        updateUserStateInTweetsCache(oldData, variables.userId, toggleBlockState),
      );

      // Remove blocked user from whoToFollow in explore cache (ForYou tab)
      if (!variables.isBlocked) {
        queryClient.setQueryData<IExploreResponse>(['explore', 'forYou'], (oldData) =>
          removeFromExploreWhoToFollow(oldData, variables.userId),
        );

        // Remove blocked user from dedicated whoToFollow cache (Show more screen)
        queryClient.setQueriesData<IWhoToFollowResponse>({ queryKey: ['whoToFollow'] }, (oldData) =>
          removeFromWhoToFollowCache(oldData, variables.userId),
        );
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['userList'] });
    },
    onError: (error, variables) => {
      setIsBlocked(variables.isBlocked);

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
      queryClient.invalidateQueries({ queryKey: ['userList'] });
      queryClient.invalidateQueries({ queryKey: ['explore', 'forYou'] });
      queryClient.invalidateQueries({ queryKey: ['whoToFollow'] });
    },
  });

  const toggleBlock = async (userId: string) => {
    if (blockMutation.isPending || !userId) return;
    await blockMutation.mutateAsync({ userId, isBlocked });
  };

  return {
    isBlocked,
    isLoading: blockMutation.isPending,
    toggleBlock,
    setIsBlocked,
  };
};
