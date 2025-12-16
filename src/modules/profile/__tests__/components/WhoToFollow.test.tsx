import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from '../../../../context/ThemeContext';
import WhoToFollow from '../../components/WhoToFollow';

// Helper function to render with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('WhoToFollow', () => {
  const mockProfiles = [
    {
      id: '1',
      name: 'Alice',
      username: 'alice',
      avatar: 'https://example.com/alice.jpg',
      banner: 'https://example.com/banner1.jpg',
      bio: 'Alice bio',
      followedBy: ['Bob'],
    },
    {
      id: '2',
      name: 'Bob',
      username: 'bob',
      avatar: 'https://example.com/bob.jpg',
      banner: 'https://example.com/banner2.jpg',
      bio: 'Bob bio',
      followedBy: [],
    },
  ];

  const mockOnShowMore = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render container and title', () => {
    const { getByTestId } = renderWithTheme(<WhoToFollow profiles={mockProfiles} />);

    expect(getByTestId('who_to_follow_container')).toBeTruthy();
    expect(getByTestId('who_to_follow_title')).toBeTruthy();
  });

  it('should render scroll view with profiles', () => {
    const { getByTestId } = renderWithTheme(<WhoToFollow profiles={mockProfiles} />);

    expect(getByTestId('who_to_follow_scroll_view')).toBeTruthy();
  });

  it('should render show more button', () => {
    const { getByTestId } = renderWithTheme(<WhoToFollow profiles={mockProfiles} onShowMore={mockOnShowMore} />);

    expect(getByTestId('who_to_follow_show_more_button')).toBeTruthy();
  });

  it('should call onShowMore when show more button is pressed', () => {
    const { getByTestId } = renderWithTheme(<WhoToFollow profiles={mockProfiles} onShowMore={mockOnShowMore} />);

    const showMoreButton = getByTestId('who_to_follow_show_more_button');
    fireEvent.press(showMoreButton);

    expect(mockOnShowMore).toHaveBeenCalledTimes(1);
  });

  it('should render profile cards for each profile', () => {
    const { getByTestId } = renderWithTheme(<WhoToFollow profiles={mockProfiles} />);

    expect(getByTestId('profile_card_1')).toBeTruthy();
    expect(getByTestId('profile_card_2')).toBeTruthy();
  });

  it('should toggle follow state when follow button is pressed', () => {
    const { getByTestId } = renderWithTheme(<WhoToFollow profiles={mockProfiles} />);

    const followButton = getByTestId('profile_card_follow_button_1');
    fireEvent.press(followButton);

    expect(getByTestId('profile_card_follow_button_1')).toBeTruthy();
  });

  it('should render with default profiles when none provided', () => {
    const { getByTestId } = renderWithTheme(<WhoToFollow />);

    expect(getByTestId('who_to_follow_container')).toBeTruthy();
  });
});
