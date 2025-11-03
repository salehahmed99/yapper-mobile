import { ThemeProvider } from '@/src/context/ThemeContext';
import ActionsRow from '@/src/modules/tweets/components/ActionsRow';
import { ITweet } from '@/src/modules/tweets/types';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

// Mock the icon imports
jest.mock('@/assets/icons/bookmark.svg', () => 'BookmarkIcon');
jest.mock('@/assets/icons/like.svg', () => 'LikeIcon');
jest.mock('@/assets/icons/reply.svg', () => 'ReplyIcon');
jest.mock('@/assets/icons/repost.svg', () => 'RepostIcon');
jest.mock('@/assets/icons/share.svg', () => 'ShareIcon');
jest.mock('@/assets/icons/views.svg', () => 'ViewsIcon');

const mockTweet: ITweet = {
  tweet_id: 'tweet-1',
  type: 'tweet',
  content: 'Test tweet content',
  images: [],
  videos: [],
  likes_count: 10,
  reposts_count: 5,
  views_count: 100,
  quotes_count: 2,
  replies_count: 3,
  is_liked: false,
  is_reposted: false,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  user: {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    username: 'testuser',
    avatar_url: undefined,
    verified: false,
  },
};

const mockOnReplyPress = jest.fn();
const mockOnRepostPress = jest.fn();
const mockOnLikePress = jest.fn();
const mockOnViewsPress = jest.fn();
const mockOnBookmarkPress = jest.fn();
const mockOnSharePress = jest.fn();

describe('ActionsRow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (tweet: ITweet = mockTweet, isBookmarked = false) => {
    return render(
      <ThemeProvider>
        <ActionsRow
          tweet={tweet}
          onReplyPress={mockOnReplyPress}
          onRepostPress={mockOnRepostPress}
          onLikePress={mockOnLikePress}
          onViewsPress={mockOnViewsPress}
          onBookmarkPress={mockOnBookmarkPress}
          onSharePress={mockOnSharePress}
          isBookmarked={isBookmarked}
        />
      </ThemeProvider>,
    );
  };

  describe('Rendering', () => {
    it('should render all action buttons', () => {
      renderComponent();

      expect(screen.getByLabelText('tweet_button_reply')).toBeTruthy();
      expect(screen.getByLabelText('tweet_button_repost')).toBeTruthy();
      expect(screen.getByLabelText('tweet_button_like')).toBeTruthy();
      expect(screen.getByLabelText('tweet_button_views')).toBeTruthy();
      expect(screen.getByLabelText('tweet_button_bookmark')).toBeTruthy();
      expect(screen.getByLabelText('tweet_button_share')).toBeTruthy();
    });

    it('should display correct counts', () => {
      renderComponent();

      expect(screen.getByText('3')).toBeTruthy(); // replies_count
      expect(screen.getByText('5')).toBeTruthy(); // reposts_count
      expect(screen.getByText('10')).toBeTruthy(); // likes_count
      expect(screen.getByText('100')).toBeTruthy(); // views_count
    });

    it('should not display count for bookmark and share', () => {
      renderComponent();

      // Bookmark and share buttons should not have counts
      const allButtons = screen.getAllByLabelText(/tweet_button/);
      expect(allButtons).toHaveLength(6);
    });
  });

  describe('Interactions', () => {
    it('should call onReplyPress when reply button is pressed', () => {
      renderComponent();

      const replyButton = screen.getByLabelText('tweet_button_reply');
      fireEvent.press(replyButton);

      expect(mockOnReplyPress).toHaveBeenCalledTimes(1);
    });

    it('should call onRepostPress with correct parameter when repost button is pressed', () => {
      renderComponent();

      const repostButton = screen.getByLabelText('tweet_button_repost');
      fireEvent.press(repostButton);

      expect(mockOnRepostPress).toHaveBeenCalledWith(false);
      expect(mockOnRepostPress).toHaveBeenCalledTimes(1);
    });

    it('should call onLikePress with correct parameter when like button is pressed', () => {
      renderComponent();

      const likeButton = screen.getByLabelText('tweet_button_like');
      fireEvent.press(likeButton);

      expect(mockOnLikePress).toHaveBeenCalledWith(false);
      expect(mockOnLikePress).toHaveBeenCalledTimes(1);
    });

    it('should call onViewsPress when views button is pressed', () => {
      renderComponent();

      const viewsButton = screen.getByLabelText('tweet_button_views');
      fireEvent.press(viewsButton);

      expect(mockOnViewsPress).toHaveBeenCalledTimes(1);
    });

    it('should call onBookmarkPress when bookmark button is pressed', () => {
      renderComponent();

      const bookmarkButton = screen.getByLabelText('tweet_button_bookmark');
      fireEvent.press(bookmarkButton);

      expect(mockOnBookmarkPress).toHaveBeenCalledTimes(1);
    });

    it('should call onSharePress when share button is pressed', () => {
      renderComponent();

      const shareButton = screen.getByLabelText('tweet_button_share');
      fireEvent.press(shareButton);

      expect(mockOnSharePress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Tweet States', () => {
    it('should handle liked tweet state', () => {
      const likedTweet = { ...mockTweet, is_liked: true };
      renderComponent(likedTweet);

      const likeButton = screen.getByLabelText('tweet_button_like');
      fireEvent.press(likeButton);

      expect(mockOnLikePress).toHaveBeenCalledWith(true);
    });

    it('should handle reposted tweet state', () => {
      const repostedTweet = { ...mockTweet, is_reposted: true };
      renderComponent(repostedTweet);

      const repostButton = screen.getByLabelText('tweet_button_repost');
      fireEvent.press(repostButton);

      expect(mockOnRepostPress).toHaveBeenCalledWith(true);
    });

    it('should handle bookmarked state', () => {
      renderComponent(mockTweet, true);

      expect(screen.getByLabelText('tweet_button_bookmark')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero counts', () => {
      const tweetWithZeroCounts = {
        ...mockTweet,
        likes_count: 0,
        reposts_count: 0,
        views_count: 0,
        replies_count: 0,
      };
      renderComponent(tweetWithZeroCounts);

      expect(screen.getAllByLabelText(/tweet_button/)).toHaveLength(6);
    });

    it('should handle large counts', () => {
      const tweetWithLargeCounts = {
        ...mockTweet,
        likes_count: 1500000,
        reposts_count: 250000,
        views_count: 5000000,
        replies_count: 10000,
      };
      renderComponent(tweetWithLargeCounts);

      expect(screen.getByText('1.5M')).toBeTruthy();
      expect(screen.getByText('250K')).toBeTruthy();
      expect(screen.getByText('5M')).toBeTruthy();
      expect(screen.getByText('10K')).toBeTruthy();
    });
  });
});
