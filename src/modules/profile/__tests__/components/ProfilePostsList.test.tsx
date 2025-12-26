import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from '../../../../context/ThemeContext';
import ProfilePostsList from '../../components/ProfilePostsList';

// Helper function to render with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

// Mock TweetContainer
jest.mock('@/src/modules/tweets/containers/TweetContainer', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ tweet }: { tweet: { tweetId: string } }) =>
      React.createElement(
        View,
        { testID: `tweet_container_${tweet.tweetId}` },
        React.createElement(Text, null, tweet.tweetId),
      ),
  };
});

describe('ProfilePostsList', () => {
  const mockTweets = [
    { tweetId: '1', content: 'First tweet', userId: 'user1', createdAt: '2024-01-01', type: 'tweet' },
    { tweetId: '2', content: 'Second tweet', userId: 'user1', createdAt: '2024-01-02', type: 'tweet' },
  ];

  it('should show loading indicator when isLoading is true', () => {
    const { getByTestId } = renderWithTheme(<ProfilePostsList data={[]} isLoading={true} />);

    expect(getByTestId('profile_posts_list_loading')).toBeTruthy();
  });

  it('should render list container when not loading', () => {
    const { getByTestId } = renderWithTheme(
      // @ts-expect-error - Using simplified mock data
      <ProfilePostsList data={mockTweets} isLoading={false} />,
    );

    expect(getByTestId('profile_posts_list_container')).toBeTruthy();
  });

  it('should show loading more indicator when fetching next page', () => {
    const { getByTestId } = renderWithTheme(
      // @ts-expect-error - Using simplified mock data
      <ProfilePostsList data={mockTweets} isFetchingNextPage={true} />,
    );

    expect(getByTestId('profile_posts_list_loading_more')).toBeTruthy();
  });

  it('should render empty view when tab is not active', () => {
    const { queryByTestId } = renderWithTheme(
      // @ts-expect-error - Using simplified mock data
      <ProfilePostsList data={mockTweets} isTabActive={false} />,
    );

    expect(queryByTestId('profile_posts_list_container')).toBeNull();
  });

  it('should render with empty data array', () => {
    const { getByTestId } = renderWithTheme(<ProfilePostsList data={[]} isLoading={false} />);

    expect(getByTestId('profile_posts_list_container')).toBeTruthy();
  });
});
