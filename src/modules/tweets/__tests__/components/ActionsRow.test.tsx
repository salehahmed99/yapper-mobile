import { ThemeProvider } from '@/src/context/ThemeContext';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ActionsRow from '../../components/ActionsRow';
import { ITweet } from '../../types';

// Mock TweetActionButton
jest.mock('../../components/TweetActionButton', () => {
  const { Text, Pressable } = require('react-native');

  return (props: any) => (
    <Pressable onPress={props.onPress} testID={props.testID}>
      <Text>{props.testID}</Text>
    </Pressable>
  );
});

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ActionsRow', () => {
  const mockTweet: ITweet = {
    tweetId: '1',
    content: 'test',
    user: { id: '1', name: 'John', username: 'john', avatarUrl: '', email: 'john@example.com' },
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    likesCount: 10,
    repostsCount: 5,
    quotesCount: 2,
    repliesCount: 3,
    viewsCount: 100,
    isLiked: false,
    isReposted: false,
    images: [],
    videos: [],
    type: 'tweet',
  };

  const defaultProps = {
    tweet: mockTweet,
    onReplyPress: jest.fn(),
    onRepostPress: jest.fn(),
    onLikePress: jest.fn(),
    onBookmarkPress: jest.fn(),
    isBookmarked: false,
    onSharePress: jest.fn(),
    size: 'small' as const,
  };

  it('should render all actions', () => {
    const { getByTestId } = renderWithTheme(<ActionsRow {...defaultProps} />);
    expect(getByTestId('tweet_button_reply')).toBeTruthy();
    expect(getByTestId('tweet_button_repost')).toBeTruthy();
    expect(getByTestId('tweet_button_like')).toBeTruthy();
    expect(getByTestId('tweet_button_views')).toBeTruthy();
    expect(getByTestId('tweet_button_bookmark')).toBeTruthy();
    expect(getByTestId('tweet_button_share')).toBeTruthy();
  });

  it('should handle reply press', () => {
    const { getByTestId } = renderWithTheme(<ActionsRow {...defaultProps} />);
    fireEvent.press(getByTestId('tweet_button_reply'));
    expect(defaultProps.onReplyPress).toHaveBeenCalled();
  });

  it('should handle repost press', () => {
    const { getByTestId } = renderWithTheme(<ActionsRow {...defaultProps} />);
    fireEvent.press(getByTestId('tweet_button_repost'));
    expect(defaultProps.onRepostPress).toHaveBeenCalled();
  });

  it('should handle like press', () => {
    const { getByTestId } = renderWithTheme(<ActionsRow {...defaultProps} />);
    fireEvent.press(getByTestId('tweet_button_like'));
    expect(defaultProps.onLikePress).toHaveBeenCalledWith(false);
  });

  it('should handle bookmark press', () => {
    const { getByTestId } = renderWithTheme(<ActionsRow {...defaultProps} />);
    fireEvent.press(getByTestId('tweet_button_bookmark'));
    expect(defaultProps.onBookmarkPress).toHaveBeenCalled();
  });

  it('should handle share press', () => {
    const { getByTestId } = renderWithTheme(<ActionsRow {...defaultProps} />);
    fireEvent.press(getByTestId('tweet_button_share'));
    expect(defaultProps.onSharePress).toHaveBeenCalled();
  });
});
