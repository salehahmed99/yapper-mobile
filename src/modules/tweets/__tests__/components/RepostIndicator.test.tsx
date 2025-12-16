import { ThemeProvider } from '@/src/context/ThemeContext';
import { useAuthStore } from '@/src/store/useAuthStore';
import { render } from '@testing-library/react-native';
import React from 'react';
import RepostIndicator from '../../components/RepostIndicator';

// Mock useAuthStore
jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

// Mock icons
jest.mock('@/src/components/icons/RepostIcon', () => 'RepostIcon');

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (key === 'tweets.repost.repostedByYou') return 'You reposted';
      if (key === 'tweets.repost.repostedBy') return `${options?.name} reposted`;
      return key;
    },
  }),
}));

describe('RepostIndicator', () => {
  it('should render "You reposted" when current user reposted', () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({ id: 'user1' });
    const { getByText } = renderWithTheme(<RepostIndicator repostById="user1" repostedByName="John Doe" />);
    expect(getByText('You reposted')).toBeTruthy();
  });

  it('should render "Name reposted" when someone else reposted', () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({ id: 'user1' });
    const { getByText } = renderWithTheme(<RepostIndicator repostById="user2" repostedByName="John Doe" />);
    expect(getByText('John Doe reposted')).toBeTruthy();
  });
});
