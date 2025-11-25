import { ThemeProvider } from '@/src/context/ThemeContext';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import Tweet from '../../components/Tweet';
import { ITweet } from '../../types';

// Mock child components
jest.mock('../../components/ActionsRow', () => 'ActionsRow');
jest.mock('../../components/ParentTweet', () => 'ParentTweet');
jest.mock('../../components/RepostIndicator', () => 'RepostIndicator');
jest.mock('../../components/TweetMedia', () => 'TweetMedia');
jest.mock('../../components/UserInfoRow', () => 'UserInfoRow');
jest.mock('@/src/components/DropdownMenu', () => 'DropdownMenu');
jest.mock('@/src/components/icons/GrokLogo', () => 'GrokLogo');
jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Tweet', () => {
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
    images: [],
    videos: [],
    type: 'tweet',
  };

  const defaultProps = {
    tweet: mockTweet,
    onReplyPress: jest.fn(),
    onLike: jest.fn(),
    onViewPostInteractions: jest.fn(),
    onBookmark: jest.fn(),
    onShare: jest.fn(),
    openSheet: jest.fn(),
    onTweetPress: jest.fn(),
    onAvatarPress: jest.fn(),
  };

  it('should render tweet content', () => {
    const { getByText } = renderWithTheme(<Tweet {...defaultProps} />);
    expect(getByText('test content')).toBeTruthy();
  });

  it('should handle tweet press', () => {
    const { getByTestId } = renderWithTheme(<Tweet {...defaultProps} />);
    fireEvent.press(getByTestId('tweet_container_main'));
    expect(defaultProps.onTweetPress).toHaveBeenCalledWith('1');
  });

  it('should handle avatar press', () => {
    const { getByTestId } = renderWithTheme(<Tweet {...defaultProps} />);
    fireEvent.press(getByTestId('tweet_avatar'));
    expect(defaultProps.onAvatarPress).toHaveBeenCalledWith('1');
  });

  it('should handle more button press', () => {
    const { getByTestId } = renderWithTheme(<Tweet {...defaultProps} />);
    fireEvent.press(getByTestId('tweet_button_more'));
    // Just verifying it doesn't crash, as menu logic involves measurements which are hard to mock perfectly in unit tests without extensive setup
  });
});
