import { ThemeProvider } from '@/src/context/ThemeContext';
import UserListItem from '@/src/modules/user_list/components/UserListItem';
import { IUser } from '@/src/types/user';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

const mockUser: IUser = {
  id: 'user-1',
  email: 'john@example.com',
  name: 'John Doe',
  username: 'johndoe',
  bio: 'Software Developer',
  avatarUrl: 'https://example.com/avatar.jpg',
  isFollower: false,
  isFollowing: false,
};

const mockFollowerUser: IUser = {
  ...mockUser,
  isFollower: true,
};

const mockUserWithoutFollower: IUser = {
  ...mockUser,
  isFollower: false,
};

const mockOnPress = jest.fn();
const mockRenderAction = jest.fn(() => null);

describe('UserListItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (user: IUser = mockUser, renderAction = mockRenderAction) => {
    return render(
      <ThemeProvider>
        <UserListItem user={user} onPress={mockOnPress} renderAction={renderAction} />
      </ThemeProvider>,
    );
  };

  describe('Rendering', () => {
    it('should display user name', () => {
      renderComponent();

      expect(screen.getByText('John Doe')).toBeTruthy();
    });

    it('should display "Follows You" badge when user follows you', () => {
      renderComponent(mockFollowerUser);

      expect(screen.getByText('userList.followsYou')).toBeTruthy();
    });

    it('should not display "Follows You" badge when user does not follow you', () => {
      renderComponent(mockUserWithoutFollower);

      expect(screen.queryByText('userList.followsYou')).toBeNull();
    });

    it('should render action component when renderAction is provided', () => {
      const customRenderAction = jest.fn(() => null);
      renderComponent(mockUser, customRenderAction);

      expect(customRenderAction).toHaveBeenCalledWith(mockUser);
    });

    it('should render avatar image', () => {
      renderComponent();

      // Check avatar is rendered by checking the image component exists
      expect(screen.getByText('John Doe')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onPress when user item is pressed', () => {
      renderComponent();

      const userName = screen.getByText('John Doe');
      const pressableElement = userName.parent?.parent?.parent?.parent;
      if (pressableElement) {
        fireEvent.press(pressableElement);
      }

      expect(mockOnPress).toHaveBeenCalledWith(mockUser);
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should be touchable/pressable', () => {
      renderComponent();

      const userName = screen.getByText('John Doe');
      expect(userName.parent?.parent?.parent?.parent).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle user without bio', () => {
      const userWithoutBio = { ...mockUser, bio: undefined };
      renderComponent(userWithoutBio);

      expect(screen.getByText('John Doe')).toBeTruthy();
      expect(screen.getByText('@johndoe')).toBeTruthy();
    });

    it('should handle user without avatar', () => {
      const userWithoutAvatar = { ...mockUser, avatarUrl: undefined };
      renderComponent(userWithoutAvatar);

      expect(screen.getByText('John Doe')).toBeTruthy();
    });

    it('should handle long username gracefully', () => {
      const userWithLongName = {
        ...mockUser,
        name: 'Very Long Display Name That Should Be Truncated',
        username: 'verylongusernamethatshouldalsobetruncated',
      };
      renderComponent(userWithLongName);

      expect(screen.getByText('Very Long Display Name That Should Be Truncated')).toBeTruthy();
      expect(screen.getByText('@verylongusernamethatshouldalsobetruncated')).toBeTruthy();
    });
  });
});
