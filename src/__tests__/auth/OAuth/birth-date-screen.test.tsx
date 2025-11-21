/* eslint-disable @typescript-eslint/no-explicit-any */
import BirthDateScreen from '@/app/(auth)/OAuth/birth-date-screen';
import { Theme } from '@/src/constants/theme';
import { OAuthStep1, OAuthStep2 } from '@/src/modules/auth/services/authService';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import Toast from 'react-native-toast-message';

// Mock expo-router
const mockUseLocalSearchParams = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    back: jest.fn(),
  },
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'auth.birthDate.title': 'What is your birth date?',
        'auth.birthDate.description': 'This will not be shown publicly',
        'auth.birthDate.label': 'Date of birth',
        'auth.birthDate.buttons.signUp': 'Sign Up',
        'auth.birthDate.errorToast': 'Error',
        'auth.birthDate.errorDescriptionToast': 'Please enter a valid date of birth',
        'auth.birthDate.successToast': 'Account created successfully',
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
    },
    button: {
      primary: '#1DA1F2',
      disabled: '#cccccc',
    },
  },
  spacing: {
    xl: 24,
    mdg: 16,
  },
  typography: {
    sizes: {
      xml: 28,
    },
    fonts: {
      bold: 'Bold',
    },
  },
} as unknown as Theme;

jest.mock('@/src/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: mockTheme,
  }),
}));

// Mock Zustand store
const mockLoginUser = jest.fn();
const mockSetSkipRedirect = jest.fn();

jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: jest.fn((selector) => {
    const store = {
      loginUser: mockLoginUser,
      setSkipRedirect: mockSetSkipRedirect,
    };
    return selector(store);
  }),
}));

// Mock authService
jest.mock('@/src/modules/auth/services/authService', () => ({
  OAuthStep1: jest.fn(),
  OAuthStep2: jest.fn(),
}));

// Mock Toast
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  __esModule: true,
  default: {
    show: jest.fn(),
  },
}));

// Mock components
jest.mock('@/src/modules/auth/components/shared/TopBar', () => {
  const { View } = require('react-native');
  const React = require('react');
  return (props: any) => React.createElement(View, { testID: 'top-bar', ...props });
});

jest.mock('@/src/modules/auth/components/shared/BottomBar', () => {
  const { View } = require('react-native');
  const React = require('react');
  return (props: any) => React.createElement(View, { testID: 'bottom-bar', ...props });
});

jest.mock('@/src/modules/auth/components/shared/AuthInput', () => {
  const { View } = require('react-native');
  const React = require('react');
  return (props: any) => {
    return React.createElement(View, {
      testID: 'auth-input',
      onChangeText: props.onChange,
      value: props.value,
      ...props,
    });
  };
});

jest.mock('@/src/components/ActivityLoader', () => {
  const { View } = require('react-native');
  const React = require('react');
  return (props: any) => {
    if (!props.visible) return null;
    return React.createElement(View, { testID: 'activity-loader' });
  };
});

jest.mock('@/src/modules/auth/components/shared/Title', () => {
  const { View } = require('react-native');
  const React = require('react');
  return (props: any) => React.createElement(View, { testID: 'auth-title', ...props });
});

describe('BirthDateScreen', () => {
  const mockSessionToken = 'test-session-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({
      sessionToken: mockSessionToken,
    });
  });

  describe('Rendering', () => {
    it('should render all components correctly', () => {
      const { getByTestId, queryByTestId } = render(<BirthDateScreen />);

      expect(getByTestId('top-bar')).toBeTruthy();
      expect(getByTestId('top-bar').props.showExitButton).toBe(false);
      expect(getByTestId('auth-title')).toBeTruthy();

      const authInput = getByTestId('auth-input');
      expect(authInput).toBeTruthy();
      expect(authInput.props.description).toBe('This will not be shown publicly');
      expect(authInput.props.label).toBe('Date of birth');
      expect(authInput.props.type).toBe('date');
      expect(authInput.props.value).toBe('');

      expect(queryByTestId('activity-loader')).toBeNull();
    });

    it('should have correct bottom bar configuration', () => {
      const { getByTestId } = render(<BirthDateScreen />);

      const bottomBar = getByTestId('bottom-bar');
      expect(bottomBar.props.rightButton.label).toBe('Sign Up');
      expect(bottomBar.props.rightButton.enabled).toBe(true);
      expect(bottomBar.props.rightButton.type).toBe('primary');
      expect(typeof bottomBar.props.rightButton.onPress).toBe('function');
    });
  });

  describe('Birth Date Input', () => {
    it('should update birth date when input changes', () => {
      const { getByTestId } = render(<BirthDateScreen />);

      const authInput = getByTestId('auth-input');
      fireEvent(authInput, 'onChangeText', '2000-01-15');

      expect(authInput.props.value).toBe('2000-01-15');
    });
  });

  describe('Form Validation', () => {
    it('should show error toast for invalid or empty birth date', async () => {
      const { getByTestId } = render(<BirthDateScreen />);
      const bottomBar = getByTestId('bottom-bar');

      // Test empty date
      bottomBar.props.rightButton.onPress();

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Error',
          text2: 'Please enter a valid date of birth',
        });
      });

      expect(OAuthStep1).not.toHaveBeenCalled();
      expect(OAuthStep2).not.toHaveBeenCalled();
    });
  });

  describe('OAuth Flow', () => {
    it('should complete full OAuth flow successfully', async () => {
      const mockUsernames = ['testuser1', 'testuser2', 'testuser3'];
      const mockUser = { id: '1', username: 'testuser1' };
      const mockAccessToken = 'test-access-token';

      (OAuthStep1 as jest.Mock).mockResolvedValue({
        data: { usernames: mockUsernames },
      });
      (OAuthStep2 as jest.Mock).mockResolvedValue({
        data: { user: mockUser, accessToken: mockAccessToken },
      });

      const { getByTestId } = render(<BirthDateScreen />);

      const authInput = getByTestId('auth-input');
      fireEvent(authInput, 'onChangeText', '2000-01-15');

      const bottomBar = getByTestId('bottom-bar');
      bottomBar.props.rightButton.onPress();

      await waitFor(() => {
        expect(OAuthStep1).toHaveBeenCalledWith({
          oauthSessionToken: mockSessionToken,
          birthDate: '2000-01-15',
        });
      });

      await waitFor(() => {
        expect(OAuthStep2).toHaveBeenCalledWith({
          oauthSessionToken: mockSessionToken,
          username: 'testuser1',
        });
      });

      expect(mockSetSkipRedirect).toHaveBeenCalledWith(true);
      expect(mockLoginUser).toHaveBeenCalledWith(mockUser, mockAccessToken);

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: 'Account created successfully',
      });

      expect(router.replace).toHaveBeenCalledWith({
        pathname: '/(auth)/OAuth/user-name-screen',
        params: {
          sessionToken: mockSessionToken,
          userNames: JSON.stringify(mockUsernames),
        },
      });
    });

    it('should use custom session token from route params', async () => {
      const customSessionToken = 'custom-session-token-456';
      mockUseLocalSearchParams.mockReturnValue({
        sessionToken: customSessionToken,
      });

      (OAuthStep1 as jest.Mock).mockResolvedValue({
        data: { usernames: ['testuser1'] },
      });
      (OAuthStep2 as jest.Mock).mockResolvedValue({
        data: {
          user: { id: '1', username: 'testuser1' },
          accessToken: 'test-access-token',
        },
      });

      const { getByTestId } = render(<BirthDateScreen />);

      const authInput = getByTestId('auth-input');
      fireEvent(authInput, 'onChangeText', '2000-01-15');

      const bottomBar = getByTestId('bottom-bar');
      bottomBar.props.rightButton.onPress();

      await waitFor(() => {
        expect(OAuthStep1).toHaveBeenCalledWith({
          oauthSessionToken: customSessionToken,
          birthDate: '2000-01-15',
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle OAuthStep1 failure', async () => {
      const errorMessage = 'Network error';
      (OAuthStep1 as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { getByTestId } = render(<BirthDateScreen />);

      const authInput = getByTestId('auth-input');
      fireEvent(authInput, 'onChangeText', '2000-01-15');

      const bottomBar = getByTestId('bottom-bar');
      bottomBar.props.rightButton.onPress();

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Error',
          text2: errorMessage,
        });
      });

      expect(router.replace).not.toHaveBeenCalled();
      expect(mockLoginUser).not.toHaveBeenCalled();
    });

    it('should handle OAuthStep2 failure', async () => {
      const errorMessage = 'Authentication failed';
      (OAuthStep1 as jest.Mock).mockResolvedValue({
        data: { usernames: ['testuser1', 'testuser2'] },
      });
      (OAuthStep2 as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { getByTestId } = render(<BirthDateScreen />);

      const authInput = getByTestId('auth-input');
      fireEvent(authInput, 'onChangeText', '2000-01-15');

      const bottomBar = getByTestId('bottom-bar');
      bottomBar.props.rightButton.onPress();

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Error',
          text2: errorMessage,
        });
      });

      expect(router.replace).not.toHaveBeenCalled();
      expect(mockLoginUser).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should show and hide loader during OAuth flow', async () => {
      (OAuthStep1 as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: { usernames: ['testuser1'] },
                }),
              100,
            ),
          ),
      );
      (OAuthStep2 as jest.Mock).mockResolvedValue({
        data: {
          user: { id: '1', username: 'testuser1' },
          accessToken: 'test-access-token',
        },
      });

      const { getByTestId, queryByTestId } = render(<BirthDateScreen />);

      const authInput = getByTestId('auth-input');
      fireEvent(authInput, 'onChangeText', '2000-01-15');

      const bottomBar = getByTestId('bottom-bar');
      bottomBar.props.rightButton.onPress();

      await waitFor(() => {
        expect(queryByTestId('activity-loader')).toBeTruthy();
      });

      await waitFor(() => {
        expect(router.replace).toHaveBeenCalled();
      });

      expect(queryByTestId('activity-loader')).toBeNull();
    });

    it('should disable button during loading and re-enable after completion', async () => {
      (OAuthStep1 as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: { usernames: ['testuser1'] },
                }),
              100,
            ),
          ),
      );
      (OAuthStep2 as jest.Mock).mockResolvedValue({
        data: {
          user: { id: '1', username: 'testuser1' },
          accessToken: 'test-access-token',
        },
      });

      const { getByTestId } = render(<BirthDateScreen />);

      const authInput = getByTestId('auth-input');
      fireEvent(authInput, 'onChangeText', '2000-01-15');

      const bottomBar = getByTestId('bottom-bar');
      bottomBar.props.rightButton.onPress();

      await waitFor(() => {
        const updatedBottomBar = getByTestId('bottom-bar');
        expect(updatedBottomBar.props.rightButton.enabled).toBe(false);
      });

      await waitFor(() => {
        expect(router.replace).toHaveBeenCalled();
      });

      const updatedBottomBar = getByTestId('bottom-bar');
      expect(updatedBottomBar.props.rightButton.enabled).toBe(true);
    });
  });
});
