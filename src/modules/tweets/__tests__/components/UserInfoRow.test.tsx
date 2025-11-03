import { ThemeProvider } from '@/src/context/ThemeContext';
import UserInfoRow from '@/src/modules/tweets/components/UserInfoRow';
import { ITweet } from '@/src/modules/tweets/types';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

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
    name: 'John Doe',
    username: 'johndoe',
    avatar_url: undefined,
    verified: false,
  },
};

describe('UserInfoRow', () => {
  const renderComponent = (tweet: ITweet = mockTweet) => {
    return render(
      <ThemeProvider>
        <UserInfoRow tweet={tweet} />
      </ThemeProvider>,
    );
  };

  describe('Rendering', () => {
    it('should display user name', () => {
      renderComponent();

      expect(screen.getByText('John Doe')).toBeTruthy();
    });

    it('should display username with @ symbol', () => {
      renderComponent();

      expect(screen.getByText('@johndoe')).toBeTruthy();
    });

    it('should display formatted timestamp', () => {
      renderComponent();

      // The formatTweetDate function will format this based on current time
      // We just verify some timestamp text is rendered
      const timestamps = screen.getAllByText(/\d/);
      expect(timestamps.length).toBeGreaterThan(0);
    });
  });

  describe('Different Timestamps', () => {
    it('should display "now" for very recent tweets', () => {
      const recentTweet = {
        ...mockTweet,
        created_at: new Date().toISOString(),
      };
      renderComponent(recentTweet);

      expect(screen.getByText('now')).toBeTruthy();
    });

    it('should display minutes for tweets less than an hour old', () => {
      const date = new Date();
      date.setMinutes(date.getMinutes() - 30);
      const recentTweet = {
        ...mockTweet,
        created_at: date.toISOString(),
      };
      renderComponent(recentTweet);

      expect(screen.getByText(/\d+m/)).toBeTruthy();
    });

    it('should display hours for tweets less than a day old', () => {
      const date = new Date();
      date.setHours(date.getHours() - 5);
      const recentTweet = {
        ...mockTweet,
        created_at: date.toISOString(),
      };
      renderComponent(recentTweet);

      expect(screen.getByText(/\d+h/)).toBeTruthy();
    });

    it('should display days for tweets less than a week old', () => {
      const date = new Date();
      date.setDate(date.getDate() - 3);
      const recentTweet = {
        ...mockTweet,
        created_at: date.toISOString(),
      };
      renderComponent(recentTweet);

      expect(screen.getByText(/\d+d/)).toBeTruthy();
    });

    it('should display full date for tweets older than a week', () => {
      const date = new Date();
      date.setDate(date.getDate() - 10);
      const oldTweet = {
        ...mockTweet,
        created_at: date.toISOString(),
      };
      renderComponent(oldTweet);

      // Should display DD/MM/YYYY format
      expect(screen.getByText(/\d{2}\/\d{2}\/\d{4}/)).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle long names', () => {
      const tweetWithLongName = {
        ...mockTweet,
        user: {
          ...mockTweet.user,
          name: 'Very Long Display Name That Should Be Handled Properly',
        },
      };
      renderComponent(tweetWithLongName);

      expect(screen.getByText('Very Long Display Name That Should Be Handled Properly')).toBeTruthy();
    });

    it('should handle long usernames', () => {
      const tweetWithLongUsername = {
        ...mockTweet,
        user: {
          ...mockTweet.user,
          username: 'verylongusernamethatshouldalsobehandledproperly',
        },
      };
      renderComponent(tweetWithLongUsername);

      expect(screen.getByText('@verylongusernamethatshouldalsobehandledproperly')).toBeTruthy();
    });

    it('should handle special characters in username', () => {
      const tweetWithSpecialUsername = {
        ...mockTweet,
        user: {
          ...mockTweet.user,
          username: 'user_name_123',
        },
      };
      renderComponent(tweetWithSpecialUsername);

      expect(screen.getByText('@user_name_123')).toBeTruthy();
    });
  });
});
