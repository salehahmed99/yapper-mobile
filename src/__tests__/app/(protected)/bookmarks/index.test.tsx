import BookmarksScreen from '@/app/(protected)/bookmarks/index';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { useBookmarks } from '@/src/modules/tweets/hooks/useBookmarks';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

// Mocks
jest.mock('@/src/modules/tweets/hooks/useBookmarks', () => ({
  useBookmarks: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
}));

jest.mock('@/src/modules/tweets/components/TweetList', () => {
  const { View, Text } = require('react-native');
  return ({ data, isLoading }: any) => (
    <View testID="tweet_list">{isLoading ? <Text>Loading...</Text> : <Text>Tweets: {data.length}</Text>}</View>
  );
});

jest.mock('@/src/modules/tweets/components/MediaViewerModal', () => {
  const { View } = require('react-native');
  return () => <View testID="media_viewer_modal" />;
});

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('BookmarksScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useBookmarks as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      refetch: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });
  });

  it('should render header and list', () => {
    renderWithTheme(<BookmarksScreen />);
    expect(screen.getByTestId('bookmarks_header_title')).toBeTruthy();
    expect(screen.getByTestId('tweet_list')).toBeTruthy();
  });

  it('should pass data to TweetList', () => {
    (useBookmarks as jest.Mock).mockReturnValue({
      data: { pages: [{ data: [1, 2, 3] }] },
      isLoading: false,
    });

    renderWithTheme(<BookmarksScreen />);
    expect(screen.getByText('Tweets: 3')).toBeTruthy();
  });
});
