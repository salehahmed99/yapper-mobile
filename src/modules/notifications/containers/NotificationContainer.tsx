import AccountIcon from '@/src/components/icons/AccountIcon';
import LikeIcon from '@/src/components/icons/LikeIcon';
import RepostIcon from '@/src/components/icons/RepostIcon';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuthStore } from '@/src/store/useAuthStore';

import { IUser } from '@/src/types/user';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import TweetContainer from '../../tweets/containers/TweetContainer';
import { ITweet } from '../../tweets/types';
import Notification from '../components/Notification';
import { INotification } from '../types';

interface INotificationContainerProps {
  notification: INotification;
}
const NotificationContainer = (props: INotificationContainerProps) => {
  const { notification } = props;

  const { theme } = useTheme();

  const currentUser = useAuthStore((state) => state.user);

  const notificationData = useMemo(() => {
    return getNotificationDisplayData(notification, theme);
  }, [notification, theme]);

  const handleAvatarPress = (userId: string) => {
    router.push({ pathname: '/(protected)/(profile)/[id]', params: { id: userId } });
  };

  const handleNotificationPress = () => {
    if (notification.type === 'follow') {
      if (notificationData.users.length === 1) {
        router.push({
          pathname: '/(protected)/(profile)/[id]',
          params: { id: notificationData.users[0].id },
        });
      }
    } else {
      // this means that the type is either like or repost
      if (notificationData.tweets.length === 1) {
        // navigate to tweet details screen
        router.push({
          pathname: '/(protected)/tweets/[tweetId]',
          params: { tweetId: notificationData.tweets[0].tweetId },
        });
      } else {
        // navigate to new custom notification tweets screen
      }
    }
  };

  let tweet: ITweet | null = null;
  if (notification.type === 'quote') {
    tweet = {
      ...notification.quoteTweet,
      user: notification.quoter,
      parentTweet:
        notification.quoteTweet.parentTweet && currentUser
          ? {
              ...notification.quoteTweet.parentTweet,
              user: currentUser,
              parentTweet: undefined,
            }
          : undefined,
    };
  } else if (notification.type === 'reply') {
    tweet = {
      ...notification.replyTweet,
      user: notification.replier,
      parentTweet:
        notification.originalTweet && currentUser
          ? {
              ...notification.originalTweet,
              user: currentUser,
              parentTweet: undefined,
            }
          : undefined,
    };
  } else if (notification.type === 'mention') {
    tweet = { ...notification.tweet, user: notification.mentioner, parentTweet: undefined };
  }

  if (tweet) {
    return <TweetContainer tweet={tweet} />;
  }

  return (
    <Notification
      users={notificationData.users}
      createdAt={notification.createdAt}
      title={notificationData.title}
      body={notificationData.body}
      icon={notificationData.icon}
      onAvatarPress={handleAvatarPress}
      onPress={handleNotificationPress}
    />
  );
};
const formatFollowTitle = (followers: IUser[]) => {
  if (followers.length === 1) {
    return `${followers[0].name} followed you`;
  }
  if (followers.length === 2) {
    return `${followers[0].name} and ${followers[1].name} followed you`;
  }
  return `${followers[0].name} and ${followers.length - 1} others followed you`;
};

const formatInteractionTitle = (users: IUser[], tweetLength: number, verb: 'liked' | 'reposted') => {
  const userCount = users.length;

  if (tweetLength === 1) {
    if (userCount === 1) {
      return `${users[0].name} ${verb} your post`;
    }
    if (userCount === 2) {
      return `${users[0].name} and ${users[1].name} ${verb} your post`;
    }
    return `${users[0].name} and ${userCount - 1} others ${verb} your post`;
  } else {
    // Multi Tweet
    return `${users[0].name} ${verb} ${tweetLength} of your posts`;
  }
};

const getNotificationDisplayData = (notification: INotification, theme: Theme) => {
  switch (notification.type) {
    case 'follow':
      return {
        users: notification.followers,
        icon: <AccountIcon size={theme.iconSizes.lg} stroke={theme.colors.accent.bookmark} />,
        title: formatFollowTitle(notification.followers),
        body: '',
        tweets: [],
      };
    case 'like':
      return {
        users: notification.likers,
        icon: <LikeIcon size={theme.iconSizes.lg} stroke={theme.colors.accent.like} filled={true} />,
        title: formatInteractionTitle(notification.likers, notification.tweets.length, 'liked'),
        body: notification.tweets[notification.tweets.length - 1]?.content || '',
        tweets: notification.tweets,
      };
    case 'repost':
      return {
        users: notification.reposters,
        icon: <RepostIcon size={theme.iconSizes.lg} stroke={theme.colors.accent.repost} />,
        title: formatInteractionTitle(notification.reposters, notification.tweets.length, 'reposted'),
        body: notification.tweets[notification.tweets.length - 1]?.content || '',
        tweets: notification.tweets,
      };
    default:
      return {
        users: [],
        icon: null,
        title: '',
        body: '',
        tweets: [],
      };
  }
};

export default NotificationContainer;
