/* eslint-disable @typescript-eslint/no-explicit-any */
import UserNameScreen from '@/app/(auth)/sign-up/user-name-screen';
import { Theme } from '@/src/constants/theme';
import { updateUserName } from '@/src/services/userService';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
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

// Mock UserNameScreenShared
jest.mock('@/src/modules/auth/components/shared/UserNameScreenShared', () => {
  const React = require('react');

  return function MockUserNameScreenShared(props: any) {
    const { availableUsernames, onNext, onSkip, translations } = props;
    const { View, Text, Button } = require('react-native');

    return React.createElement(
      View,
      { testID: 'username-screen-shared' },
      React.createElement(Text, { testID: 'title' }, translations.title),
      React.createElement(Text, { testID: 'subtitle' }, translations.subtitle),
      React.createElement(Text, { testID: 'usernames' }, availableUsernames.join(', ')),
      React.createElement(Button, {
        testID: 'next-button',
        title: translations.next,
        onPress: async () => {
          try {
            await onNext(availableUsernames[0]);
          } catch {
            // Error handled by component
          }
        },
      }),
      React.createElement(Button, {
        testID: 'skip-button',
        title: translations.skipForNow,
        onPress: onSkip,
      }),
    );
  };
});

describe('UserNameScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEmail = 'test@example.com';
    mockUserNames = ['testuser1', 'testuser2', 'testuser3'];
  });

  describe('Rendering', () => {
    it('should render the shared component with correct props', () => {
      const { getByTestId, getByText } = render(<UserNameScreen />);

      expect(getByTestId('username-screen-shared')).toBeTruthy();
      expect(getByText("What's your username?")).toBeTruthy();
      expect(getByText('testuser1, testuser2, testuser3')).toBeTruthy();
    });

    it('should pass correct translations to shared component', () => {
      const { getByText } = render(<UserNameScreen />);

      expect(getByText("What's your username?")).toBeTruthy();
      expect(getByText('Choose a unique username for your account')).toBeTruthy();
      expect(getByText('Next')).toBeTruthy();
      expect(getByText('Skip for now')).toBeTruthy();
    });
  });

  describe('Navigation Guards', () => {
    it('should redirect to create account if missing email', () => {
      mockEmail = '';
      render(<UserNameScreen />);
      expect(router.replace).toHaveBeenCalledWith('/(auth)/sign-up/create-account-screen');
    });

    it('should redirect to create account if missing usernames', () => {
      mockUserNames = [];
      render(<UserNameScreen />);
      expect(router.replace).toHaveBeenCalledWith('/(auth)/sign-up/create-account-screen');
    });

    it('should navigate to protected route when skip is pressed', async () => {
      const { getByTestId } = render(<UserNameScreen />);
      const skipButton = getByTestId('skip-button');

      fireEvent.press(skipButton);

      expect(router.push).toHaveBeenCalledWith('/(protected)');
    });
  });

  describe('Username Update Flow', () => {
    it('should call updateUserName and navigate when submitting new username', async () => {
      (updateUserName as jest.Mock).mockResolvedValue({ success: true });
      // Use a different username to trigger API call
      mockUserNames = ['newusername', 'testuser2', 'testuser3'];
      mockGetState.mockReturnValue({ userNames: ['originaluser', 'testuser2'] });

      const { getByTestId } = render(<UserNameScreen />);
      const nextButton = getByTestId('next-button');

      fireEvent.press(nextButton);

      await waitFor(() => {
        expect(updateUserName).toHaveBeenCalledWith('newusername');
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'success',
          text1: 'Username set',
          text2: 'Your username is newusername',
        });
        expect(mockSetSkipRedirect).toHaveBeenCalledWith(false);
        expect(router.replace).toHaveBeenCalledWith('/(protected)');
      });
    });

    it('should skip API call when username matches first suggestion', async () => {
      const { getByTestId } = render(<UserNameScreen />);
      const nextButton = getByTestId('next-button');

      // Mock getState to return the same first username
      mockGetState.mockReturnValue({ userNames: ['testuser1', 'testuser2'] });

      fireEvent.press(nextButton);

      await waitFor(() => {
        expect(updateUserName).not.toHaveBeenCalled();
        expect(mockSetSkipRedirect).toHaveBeenCalledWith(false);
        expect(router.replace).toHaveBeenCalledWith('/(protected)');
      });
    });

    it('should handle API errors gracefully', async () => {
      (updateUserName as jest.Mock).mockRejectedValue(new Error('Network error'));
      // Use different username to trigger API call
      mockUserNames = ['newusername', 'testuser2'];

      const { getByTestId } = render(<UserNameScreen />);
      const nextButton = getByTestId('next-button');

      // Suppress console error from rejected promise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      fireEvent.press(nextButton);

      await waitFor(() => {
        expect(updateUserName).toHaveBeenCalledWith('newusername');
      });

      consoleSpy.mockRestore();
    });
  });
});
