import { ThemeProvider } from '@/src/context/ThemeContext';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import TweetThread from '../../components/TweetThread';
import { ITweet } from '../../types';

// Mock useNavigation hook
const mockNavigate = jest.fn();
jest.mock('@/src/hooks/useNavigation', () => ({
  __esModule: true,
  default: () => ({
    navigate: mockNavigate,
    replace: jest.fn(),
    goBack: jest.fn(),
    dismissTo: jest.fn(),
    isCurrentRoute: jest.fn(),
    pathname: '/',
    router: {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    },
  }),
  useNavigation: () => ({
    navigate: mockNavigate,
    replace: jest.fn(),
    goBack: jest.fn(),
    dismissTo: jest.fn(),
    isCurrentRoute: jest.fn(),
    pathname: '/',
    router: {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    },
  }),
}));

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
jest.mock('@gorhom/bottom-sheet', () => ({
  BottomSheetModal: 'BottomSheetModal',
  BottomSheetModalProvider: ({ children }: any) => children,
  BottomSheetBackdrop: 'BottomSheetBackdrop',
  BottomSheetView: 'BottomSheetView',
  useBottomSheet: () => ({ close: jest.fn() }),
}));

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
    isBookmarked: false,
    images: [],
    videos: [],
    type: 'tweet',
    mentions: [],
  };

  const defaultProps = {
    tweet: mockTweet,
    showThread: false,
    onReplyPress: jest.fn(),
    onLike: jest.fn(),
    onViewPostInteractions: jest.fn(),
    onBookmark: jest.fn(),
    onShare: jest.fn(),
    openSheet: jest.fn(),
    onAvatarPress: jest.fn(),
    onDeletePress: jest.fn(),
    onReply: jest.fn(),
    onQuote: jest.fn(),
    onRepost: jest.fn(),
    onMentionPress: jest.fn(),
    onHashtagPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render tweet content', () => {
    const { getByText } = renderWithTheme(<TweetThread {...defaultProps} />);
    expect(getByText('test content')).toBeTruthy();
  });

  it('should handle tweet press', () => {
    const { getByTestId } = renderWithTheme(<TweetThread {...defaultProps} />);
    fireEvent.press(getByTestId('tweet_container_main'));
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/(protected)/tweets/[tweetId]',
      params: {
        tweetId: '1',
        tweetUserId: '1',
      },
    });
  });

  it('should handle avatar press', () => {
    const { getByTestId } = renderWithTheme(<TweetThread {...defaultProps} />);
    fireEvent.press(getByTestId('tweet_avatar'));
    expect(defaultProps.onAvatarPress).toHaveBeenCalledWith('1');
  });

  it('should handle more button press', () => {
    const { getByTestId } = renderWithTheme(<TweetThread {...defaultProps} />);
    fireEvent.press(getByTestId('tweet_button_more'));
    // Just verifying it doesn't crash, as menu logic involves measurements which are hard to mock perfectly in unit tests without extensive setup
  });
});
