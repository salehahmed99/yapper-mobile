import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from '../../../../context/ThemeContext';
import MutualFollowers from '../../components/MutualFollowers';

// Helper function to render with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('MutualFollowers', () => {
  const mockMutualFollowers = [
    { userId: '1', username: 'alice', name: 'Alice', avatarUrl: 'https://example.com/alice.jpg' },
    { userId: '2', username: 'bob', name: 'Bob', avatarUrl: 'https://example.com/bob.jpg' },
    { userId: '3', username: 'charlie', name: 'Charlie', avatarUrl: 'https://example.com/charlie.jpg' },
  ];

  it('should render with mutual followers', () => {
    const { getByText } = renderWithTheme(<MutualFollowers mutualFollowers={mockMutualFollowers} totalCount={3} />);

    expect(getByText(/Alice|Bob|Charlie/)).toBeTruthy();
  });

  it('should return null when mutualFollowers is empty', () => {
    const { toJSON } = renderWithTheme(<MutualFollowers mutualFollowers={[]} totalCount={0} />);

    expect(toJSON()).toBeNull();
  });

  it('should return null when totalCount is 0', () => {
    const { toJSON } = renderWithTheme(<MutualFollowers mutualFollowers={mockMutualFollowers} totalCount={0} />);

    expect(toJSON()).toBeNull();
  });

  it('should display up to 3 avatars', () => {
    const fourFollowers = [
      ...mockMutualFollowers,
      { userId: '4', username: 'david', name: 'David', avatarUrl: 'https://example.com/david.jpg' },
    ];

    const { toJSON } = renderWithTheme(<MutualFollowers mutualFollowers={fourFollowers} totalCount={4} />);

    expect(toJSON()).not.toBeNull();
  });

  it('should handle followers without names', () => {
    const followersNoNames = [{ userId: '1', username: 'user1', name: '', avatarUrl: 'https://example.com/1.jpg' }];

    const { toJSON } = renderWithTheme(<MutualFollowers mutualFollowers={followersNoNames} totalCount={1} />);

    expect(toJSON()).toBeNull();
  });

  it('should render with one mutual follower', () => {
    const oneFollower = [mockMutualFollowers[0]];

    const { getByText } = renderWithTheme(<MutualFollowers mutualFollowers={oneFollower} totalCount={1} />);

    expect(getByText(/Alice/)).toBeTruthy();
  });
});
