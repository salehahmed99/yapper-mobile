import { ThemeProvider } from '@/src/context/ThemeContext';
import { render } from '@testing-library/react-native';
import React from 'react';
import UserInfoRow from '../../components/UserInfoRow';
import { ITweet } from '../../types';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('UserInfoRow', () => {
  const mockTweet: ITweet = {
    tweetId: '1',
    content: 'test',
    user: {
      id: '1',
      name: 'John Doe',
      username: 'johndoe',
      avatarUrl: 'url',
      email: 'john@example.com',
    },
    createdAt: '2023-01-01T12:00:00Z',
    updatedAt: '2023-01-01T12:00:00Z',
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

  it('should render user info correctly', () => {
    const { getByText } = renderWithTheme(<UserInfoRow tweet={mockTweet} />);
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('@johndoe')).toBeTruthy();
  });
});
