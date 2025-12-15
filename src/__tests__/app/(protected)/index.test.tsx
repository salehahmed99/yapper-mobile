import HomeScreen from '@/app/(protected)/index';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { useTweets } from '@/src/modules/tweets/hooks/useTweets';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

// Mocks
jest.mock('@/src/modules/tweets/hooks/useTweets', () => ({
  useTweets: jest.fn(),
}));

jest.mock('@/src/modules/tweets/hooks/useTweetActions', () => ({
  useTweetActions: () => ({ addPostMutation: { mutate: jest.fn() } }),
}));

jest.mock('@/src/modules/tweets/components/TweetList', () => {
  const { View, Text } = require('react-native');
  return ({ data }: any) => (
    <View testID="tweet_list">
      <Text>Len: {data?.length}</Text>
    </View>
  );
});

jest.mock('@/src/modules/tweets/components/Fab', () => {
  const { View } = require('react-native');
  return () => <View testID="fab" />;
});

jest.mock('@/src/modules/tweets/components/CreatePostModal', () => {
  const { View } = require('react-native');
  return () => <View testID="create_post_modal" />;
});
jest.mock('@/src/modules/tweets/components/MediaViewerModal', () => {
  const { View } = require('react-native');
  return () => <View testID="media_viewer_modal" />;
});
jest.mock('@/src/components/home/HomeTabView', () => {
  const { View } = require('react-native');
  return () => <View testID="home_tab_view" />;
});
jest.mock('@/src/components/shell/AppBar', () => {
  const { View } = require('react-native');
  return ({ children, tabView }: any) => (
    <View testID="app_bar">
      {children}
      {tabView}
    </View>
  );
});

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTweets as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
    });
  });

  it('should render home screen structure', () => {
    renderWithTheme(<HomeScreen />);
    expect(screen.getByTestId('app_bar')).toBeTruthy();
    expect(screen.getByTestId('home_tab_view')).toBeTruthy();
    expect(screen.getByTestId('fab')).toBeTruthy();
  });
});
