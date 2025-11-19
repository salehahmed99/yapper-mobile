/* eslint-disable @typescript-eslint/no-explicit-any */
import UserNameScreen from '@/app/(auth)/sign-up/user-name-screen';
import { Theme } from '@/src/constants/theme';
import { updateUserName } from '@/src/services/userService';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { TextInput } from 'react-native';
import Toast from 'react-native-toast-message';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      const translations: Record<string, string> = {
        'auth.signUp.userName.title': "What's your username?",
        'auth.signUp.userName.subtitle': 'Choose a unique username for your account',
        'auth.signUp.userName.usernameLabel': 'Username',
        'auth.signUp.userName.skipButton': 'Skip for now',
        'auth.signUp.userName.showMore': 'Show more',
        'auth.signUp.userName.showLess': 'Show less',
        'auth.signUp.userName.errors.usernameRequired': 'Username is required',
        'auth.signUp.userName.errors.selectOrEnter': 'Please select or enter a username',
        'auth.signUp.userName.errors.invalidUsername': 'Invalid username',
        'auth.signUp.userName.errors.usernameFormat':
          'Username must be 3-15 characters, letters, numbers, and underscores only',
        'auth.signUp.userName.errors.minLength': 'Username must be at least 3 characters',
        'auth.signUp.userName.errors.error': 'Error',
        'auth.signUp.userName.success.usernameSet': 'Username set',
        'auth.signUp.userName.success.yourUsername': `Your username is ${params?.username || '@username'}`,
        'buttons.next': 'Next',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock ThemeContext
const mockTheme: Theme = {
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#f5f5f5',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
      link: '#1DA1F2',
    },
    button: {
      primary: '#1DA1F2',
      disabled: '#cccccc',
    },
    border: '#e1e8ed',
    error: '#f44336',
    success: '#4caf50',
  },
  spacing: {
    xl: 24,
    md: 12,
    lg: 16,
    xs: 8,
    xxl: 32,
    sm: 10,
    xxs: 4,
    xxxl: 48,
  },
  typography: {
    sizes: {
      sm: 14,
      xs: 12,
      md: 16,
      xml: 30,
    },
    fonts: {
      regular: 'System',
      bold: 'System-Bold',
    },
    lineHeights: {
      relaxed: 1.5,
    },
  },
  borderWidth: {
    thin: 1,
    medium: 2,
  },
  borderRadius: {
    sm: 4,
    lg: 20,
  },
} as unknown as Theme;

jest.mock('@/src/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: mockTheme,
  }),
}));

// Mock Zustand stores
let mockEmail = 'test@example.com';
let mockUserNames = ['testuser1', 'testuser2', 'testuser3'];

const mockGetState = jest.fn(() => ({
  userNames: mockUserNames,
}));

jest.mock('@/src/modules/auth/store/useSignUpStore', () => ({
  useSignUpStore: Object.assign(
    (selector: (store: { email: string; userNames: string[] }) => unknown) => {
      const store = {
        email: mockEmail,
        userNames: mockUserNames,
      };
      return selector(store);
    },
    {
      getState: () => mockGetState(),
    },
  ),
}));

const mockSetSkipRedirect = jest.fn();

jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: jest.fn((selector) => {
    const store = {
      setSkipRedirect: mockSetSkipRedirect,
    };
    return selector(store);
  }),
}));

// Mock userService
jest.mock('@/src/services/userService', () => ({
  updateUserName: jest.fn(),
}));

// Mock Toast
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  __esModule: true,
  default: {
    show: jest.fn(),
  },
}));

// Mock ActivityLoader
jest.mock('@/src/components/ActivityLoader', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ visible }: { visible: boolean }) =>
    visible ? React.createElement(View, { testID: 'activity-loader' }) : null;
});

// Mock auth components
jest.mock('@/src/modules/auth/components/shared/BottomBar', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, { testID: 'bottom-bar', ...props });
});

jest.mock('@/src/modules/auth/components/shared/TopBar', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, { testID: 'top-bar', ...props });
});

// Mock lucide-react-native
jest.mock('lucide-react-native', () => ({
  Check: ({ color, size }: { color: string; size: number }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: 'check-icon', accessibilityLabel: `check-${color}-${size}` });
  },
}));

describe('UserNameScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEmail = 'test@example.com';
    mockUserNames = ['testuser1', 'testuser2', 'testuser3'];
  });

  // Helper to get TextInput
  const getUsernameInput = (container: ReturnType<typeof render>) => {
    return container.UNSAFE_getByType(TextInput);
  };

  describe('Rendering', () => {
    it('should render the screen with username suggestions', () => {
      const { getByText, getByDisplayValue, queryByText } = render(<UserNameScreen />);

      expect(getByText("What's your username?")).toBeTruthy();
      expect(getByDisplayValue('testuser1')).toBeTruthy();
      expect(getByText('testuser1')).toBeTruthy();
      expect(getByText('testuser2')).toBeTruthy();
      expect(queryByText('testuser3')).toBeFalsy(); // Only shows 2 initially
      expect(getByText('Show more')).toBeTruthy();
    });

    it('should not show "Show more" button when there are 2 or fewer usernames', () => {
      mockUserNames = ['testuser1', 'testuser2'];
      const { queryByText } = render(<UserNameScreen />);

      expect(queryByText('Show more')).toBeFalsy();
    });
  });

  describe('Navigation Guards', () => {
    it('should redirect to create account if missing required data', () => {
      mockEmail = '';
      render(<UserNameScreen />);
      expect(router.replace).toHaveBeenCalledWith('/(auth)/sign-up/create-account-screen');

      jest.clearAllMocks();

      mockEmail = 'test@example.com';
      mockUserNames = [];
      render(<UserNameScreen />);
      expect(router.replace).toHaveBeenCalledWith('/(auth)/sign-up/create-account-screen');
    });

    it('should navigate to protected route when skip is pressed', () => {
      const { getByTestId } = render(<UserNameScreen />);
      const bottomBar = getByTestId('bottom-bar');

      bottomBar.props.leftButton.onPress();

      expect(router.push).toHaveBeenCalledWith('/(protected)');
    });
  });

  describe('Username Input', () => {
    it('should validate username and show appropriate feedback', () => {
      const container = render(<UserNameScreen />);
      const input = getUsernameInput(container);
      const { getByText, queryByTestId } = container;

      // Valid username shows check mark
      fireEvent.changeText(input, 'validuser');
      expect(queryByTestId('check-icon')).toBeTruthy();

      // Invalid username shows error
      fireEvent.changeText(input, 'ab');
      expect(getByText('Username must be at least 3 characters')).toBeTruthy();
      expect(queryByTestId('check-icon')).toBeFalsy();
    });
  });

  describe('Username Suggestions', () => {
    it('should handle username suggestion selection', () => {
      const container = render(<UserNameScreen />);
      const input = getUsernameInput(container);
      const { getByText } = container;

      // Regular username
      fireEvent.press(getByText('testuser2'));
      expect(input.props.value).toBe('testuser2');
    });

    it('should remove @ symbol when selecting username', () => {
      mockUserNames = ['@testuser1', '@testuser2'];
      const container = render(<UserNameScreen />);
      const input = getUsernameInput(container);
      const { getByText } = container;

      fireEvent.press(getByText('@testuser2'));
      expect(input.props.value).toBe('testuser2');
    });

    it('should toggle between showing all and limited suggestions', () => {
      const container = render(<UserNameScreen />);
      const { getByText, queryByText } = container;

      // Show more
      fireEvent.press(getByText('Show more'));
      expect(getByText('testuser3')).toBeTruthy();
      expect(getByText('Show less')).toBeTruthy();

      // Show less
      fireEvent.press(getByText('Show less'));
      expect(queryByText('testuser3')).toBeFalsy();
      expect(getByText('Show more')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should enable/disable next button based on username validity', () => {
      const container = render(<UserNameScreen />);
      const input = getUsernameInput(container);
      const { getByTestId } = container;
      const bottomBar = getByTestId('bottom-bar');

      // Invalid username disables button
      fireEvent.changeText(input, 'ab');
      expect(bottomBar.props.rightButton.enabled).toBe(false);

      // Valid username enables button
      fireEvent.changeText(input, 'validuser');
      expect(bottomBar.props.rightButton.enabled).toBe(true);
    });

    it('should show appropriate error toast for invalid submissions', async () => {
      const container = render(<UserNameScreen />);
      const input = getUsernameInput(container);
      const { getByTestId } = container;
      const bottomBar = getByTestId('bottom-bar');

      // Empty username
      fireEvent.changeText(input, '');
      await bottomBar.props.rightButton.onPress();
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Username is required',
        text2: 'Please select or enter a username',
      });

      // Invalid username
      fireEvent.changeText(input, 'ab');
      await bottomBar.props.rightButton.onPress();
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Invalid username',
        text2: 'Username must be 3-15 characters, letters, numbers, and underscores only',
      });
    });
  });

  describe('Username Update Flow', () => {
    it('should call API and navigate on successful username submission', async () => {
      (updateUserName as jest.Mock).mockResolvedValue({ success: true });

      const container = render(<UserNameScreen />);
      const input = getUsernameInput(container);
      const { getByTestId } = container;
      const bottomBar = getByTestId('bottom-bar');

      fireEvent.changeText(input, 'newusername');
      bottomBar.props.rightButton.onPress();

      await waitFor(() => {
        expect(updateUserName).toHaveBeenCalledWith('newusername');
      });
    });

    it('should skip API call when username matches first suggestion', async () => {
      const container = render(<UserNameScreen />);
      const input = getUsernameInput(container);
      const { getByTestId } = container;
      const bottomBar = getByTestId('bottom-bar');

      expect(input.props.value).toBe('testuser1');
      bottomBar.props.rightButton.onPress();

      await waitFor(() => {
        expect(updateUserName).not.toHaveBeenCalled();
        expect(mockSetSkipRedirect).toHaveBeenCalledWith(false);
        expect(router.replace).toHaveBeenCalledWith('/(protected)');
      });
    });

    it('should handle API errors', async () => {
      (updateUserName as jest.Mock).mockRejectedValue(new Error('Network error'));

      const container = render(<UserNameScreen />);
      const input = getUsernameInput(container);
      const { getByTestId } = container;
      const bottomBar = getByTestId('bottom-bar');

      fireEvent.changeText(input, 'newusername');
      bottomBar.props.rightButton.onPress();

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Error',
          text2: 'Network error',
        });
      });
    });

    it('should show loader and disable button during submission', async () => {
      (updateUserName as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100)),
      );

      const container = render(<UserNameScreen />);
      const input = getUsernameInput(container);
      const { getByTestId } = container;
      const bottomBar = getByTestId('bottom-bar');

      fireEvent.changeText(input, 'newusername');
      bottomBar.props.rightButton.onPress();

      await waitFor(() => {
        expect(container.queryByTestId('activity-loader')).toBeTruthy();
        expect(getByTestId('bottom-bar').props.rightButton.enabled).toBe(false);
      });
    });
  });
});
