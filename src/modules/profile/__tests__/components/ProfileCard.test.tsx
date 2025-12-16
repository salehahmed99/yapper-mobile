import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from '../../../../context/ThemeContext';
import ProfileCard from '../../components/ProfileCard';

// Helper function to render with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ProfileCard', () => {
  const mockProfile = {
    id: '1',
    name: 'John Doe',
    username: 'johndoe',
    avatar: 'https://example.com/avatar.jpg',
    banner: 'https://example.com/banner.jpg',
    bio: 'Test bio for the user',
    followedBy: ['Alice', 'Bob'],
  };

  const mockOnFollow = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render profile card with all data', () => {
    const { getByTestId, getByText } = renderWithTheme(<ProfileCard profile={mockProfile} onFollow={mockOnFollow} />);

    expect(getByTestId(`profile_card_${mockProfile.id}`)).toBeTruthy();
    expect(getByTestId(`profile_card_name_${mockProfile.id}`)).toBeTruthy();
    expect(getByTestId(`profile_card_username_${mockProfile.id}`)).toBeTruthy();
    expect(getByText('@johndoe')).toBeTruthy();
    expect(getByText('Test bio for the user')).toBeTruthy();
  });

  it('should render avatar and banner images', () => {
    const { getByTestId } = renderWithTheme(<ProfileCard profile={mockProfile} onFollow={mockOnFollow} />);

    expect(getByTestId(`profile_card_avatar_${mockProfile.id}`)).toBeTruthy();
    expect(getByTestId(`profile_card_banner_${mockProfile.id}`)).toBeTruthy();
  });

  it('should call onFollow when follow button is pressed', () => {
    const { getByTestId } = renderWithTheme(<ProfileCard profile={mockProfile} onFollow={mockOnFollow} />);

    const followButton = getByTestId(`profile_card_follow_button_${mockProfile.id}`);
    fireEvent.press(followButton);

    expect(mockOnFollow).toHaveBeenCalledWith(mockProfile.id);
    expect(mockOnFollow).toHaveBeenCalledTimes(1);
  });

  it('should show "Follow" text when not following', () => {
    const { getByText } = renderWithTheme(
      <ProfileCard profile={mockProfile} onFollow={mockOnFollow} isFollowing={false} />,
    );

    expect(getByText('profile.follow')).toBeTruthy();
  });

  it('should show "Following" text when following', () => {
    const { getByText } = renderWithTheme(
      <ProfileCard profile={mockProfile} onFollow={mockOnFollow} isFollowing={true} />,
    );

    expect(getByText('profile.following')).toBeTruthy();
  });

  it('should render without bio when not provided', () => {
    const profileWithoutBio = { ...mockProfile, bio: undefined };
    const { queryByTestId } = renderWithTheme(<ProfileCard profile={profileWithoutBio} onFollow={mockOnFollow} />);

    expect(queryByTestId(`profile_card_bio_${mockProfile.id}`)).toBeNull();
  });

  it('should handle followed by text with zero followers', () => {
    const profileNoFollowers = { ...mockProfile, followedBy: [] };
    const { queryByText } = renderWithTheme(<ProfileCard profile={profileNoFollowers} onFollow={mockOnFollow} />);

    expect(queryByText(/profile.whoToFollow.followedBy/)).toBeNull();
  });

  it('should handle followed by text with one follower', () => {
    const profileOneFollower = { ...mockProfile, followedBy: ['Alice'] };
    const { getByText } = renderWithTheme(<ProfileCard profile={profileOneFollower} onFollow={mockOnFollow} />);

    expect(getByText(/Alice/)).toBeTruthy();
  });

  it('should handle followed by text with two followers', () => {
    const profileTwoFollowers = { ...mockProfile, followedBy: ['Alice', 'Bob'] };
    const { getByText } = renderWithTheme(<ProfileCard profile={profileTwoFollowers} onFollow={mockOnFollow} />);

    expect(getByText(/Alice/)).toBeTruthy();
  });

  it('should handle followed by text with more than two followers', () => {
    const profileManyFollowers = {
      ...mockProfile,
      followedBy: ['Alice', 'Bob', 'Charlie', 'David'],
    };
    const { getByText } = renderWithTheme(<ProfileCard profile={profileManyFollowers} onFollow={mockOnFollow} />);

    expect(getByText(/Alice/)).toBeTruthy();
  });

  it('should render default banner when banner is not provided', () => {
    const profileNoBanner = { ...mockProfile, banner: undefined };
    const { getByTestId } = renderWithTheme(<ProfileCard profile={profileNoBanner} onFollow={mockOnFollow} />);

    expect(getByTestId(`profile_card_banner_${mockProfile.id}`)).toBeTruthy();
  });
});
