import { render } from '@testing-library/react-native';
import React from 'react';
import TweetContainer from '../../containers/TweetContainer';
import { ITweet } from '../../types';

// Mock hooks
jest.mock('../../hooks/useTweet', () => ({
  useTweet: jest.fn(() => ({ data: null, isLoading: false })),
}));

jest.mock('../../hooks/useTweetActions', () => ({
  useTweetActions: jest.fn(() => ({
    likeMutation: { mutate: jest.fn() },
    repostMutation: { mutate: jest.fn() },
    replyToPostMutation: { mutate: jest.fn() },
    quotePostMutation: { mutate: jest.fn() },
  })),
}));

// Mock store
jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: jest.fn(() => ({ id: 'user1' })),
}));

// Mock router
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useLocalSearchParams: jest.fn(() => ({})),
  useSegments: jest.fn(() => []),
}));

// Mock components
jest.mock('../../components/Tweet', () => {
  const { Pressable, Text } = require('react-native');
  return (props: any) => (
    <Pressable onPress={() => props.onTweetPress(props.tweet.tweetId)} testID="tweet-component">
      <Text>{props.tweet.content}</Text>
    </Pressable>
  );
});
jest.mock('../../components/FullTweet', () => {
  const { View } = require('react-native');
  return () => <View testID="full-tweet-component" />;
});
jest.mock('../../components/CreatePostModal', () => 'CreatePostModal');
jest.mock('../../components/RepostOptionsModal', () => 'RepostOptionsModal');
jest.mock(
  '@/src/components/QueryWrapper',
  () =>
    ({ children }: any) =>
      children({ tweetId: '1', content: 'fetched' }),
);

describe('TweetContainer', () => {
  const mockTweet: ITweet = {
    tweetId: '1',
    content: 'test content',
    user: { id: '1', name: 'John', username: 'john', avatarUrl: '', email: 'john@example.com' },
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    likesCount: 0,
    repostsCount: 0,
    quotesCount: 0,
    repliesCount: 0,
    viewsCount: 0,
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
    images: [],
    videos: [],
    type: 'tweet',
  };

  it('should render Tweet component when tweet prop is provided', () => {
    const { getByText } = render(<TweetContainer tweet={mockTweet} />);
    expect(getByText('test content')).toBeTruthy();
  });

  it('should render FullTweet component when tweetId prop is provided', () => {
    // Since QueryWrapper mock calls children with a dummy tweet
    const { getByTestId } = render(<TweetContainer tweetId="1" />);
    expect(getByTestId('full-tweet-component')).toBeTruthy();
  });
});
