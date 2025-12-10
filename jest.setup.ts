/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/react-native';
import dotenv from 'dotenv';
import path from 'path';
import { Animated } from 'react-native';

// Load environment variables from .env file
dotenv.config({
  path: path.resolve(__dirname, '.env'),
  override: false, // keep existing process.env values
});

// ----------------------------
// Mock I18nManager BEFORE React Native
// ----------------------------
jest.doMock('react-native/Libraries/ReactNative/I18nManager', () => ({
  isRTL: false,
  allowRTL: jest.fn(),
  forceRTL: jest.fn(),
  doLeftAndRightSwapInRTL: true,
  getConstants: () => ({
    isRTL: false,
    doLeftAndRightSwapInRTL: true,
    localeIdentifier: 'en_US',
  }),
}));

// ----------------------------
// Mock AsyncStorage
// ----------------------------
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// ----------------------------
// Mock expo-localization
// ----------------------------
jest.mock('expo-localization', () => ({
  getLocales: () => [{ regionCode: 'US', languageCode: 'en' }],
}));

// ----------------------------
// Mock expo-updates
// ----------------------------
jest.mock('expo-updates', () => ({
  reloadAsync: jest.fn(),
}));

// ----------------------------
// Mock expo-router
// ----------------------------
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  usePathname: () => '/',
  useFocusEffect: jest.fn((callback: () => void) => {
    // Call the callback immediately in tests
    if (callback) callback();
  }),
}));

// ----------------------------
// Mock i18next
// ----------------------------
jest.mock('i18next', () => ({
  use: jest.fn().mockReturnThis(),
  init: jest.fn().mockReturnThis(),
  changeLanguage: jest.fn(),
  language: 'en',
  t: (key: string) => key,
}));

// ----------------------------
// Mock react-i18next
// ----------------------------
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// ----------------------------
// Mock expo-secure-store
// ----------------------------
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// ----------------------------
// Mock React Native Alert
// ----------------------------
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// ----------------------------
// Mock React Native Modal
// ----------------------------
jest.mock('react-native/Libraries/Modal/Modal', () => {
  const React = require('react');
  const RN = require('react-native');

  return {
    __esModule: true,
    default: ({ children, visible }: { children: React.ReactNode; visible: boolean }) =>
      visible ? React.createElement(RN.View, { testID: 'mock-modal' }, children) : null,
  };
});

// ----------------------------
// Mock Google Sign In
// ----------------------------
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    isSignedIn: jest.fn().mockResolvedValue(false),
    getTokens: jest.fn(),
    getCurrentUser: jest.fn(),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

// ----------------------------
// Mock lucide-react-native
// ----------------------------
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const RN = require('react-native');

  const MockIcon = (props: any) => React.createElement(RN.View, { testID: props.testID || 'mock-icon', ...props });

  return {
    Eye: MockIcon,
    EyeOff: MockIcon,
    Check: MockIcon,
    AlertCircle: MockIcon,
    X: MockIcon,
    ChevronLeft: MockIcon,
    ChevronRight: MockIcon,
  };
});

// ----------------------------
// Mock PasswordInput component to avoid Animated issues
// ----------------------------
jest.mock('@/src/modules/auth/components/shared/PasswordInput', () => {
  const React = require('react');
  const { TextInput, View, Text } = require('react-native');

  return (props: any) => {
    const [isVisible, setIsVisible] = React.useState(false);
    return React.createElement(
      View,
      { testID: 'password-input' },
      React.createElement(Text, null, props.label),
      React.createElement(TextInput, {
        value: props.value,
        onChangeText: props.onChangeText,
        secureTextEntry: !isVisible,
        testID: 'password-input-field',
        placeholder: props.label,
        onToggleVisibility: () => setIsVisible(!isVisible),
        ...props,
      }),
    );
  };
});

// ----------------------------
// Mock AuthInput component to avoid Animated issues
// ----------------------------
jest.mock('@/src/modules/auth/components/shared/AuthInput', () => {
  const React = require('react');
  const { TextInput, View, Text, Pressable } = require('react-native');

  return (props: any) =>
    React.createElement(
      View,
      { testID: 'auth-input-mock' },
      React.createElement(Text, null, props.label),
      props.type === 'date'
        ? React.createElement(
            Pressable,
            { onPress: () => {}, testID: 'date-input' },
            React.createElement(Text, null, props.value || props.label),
          )
        : React.createElement(TextInput, {
            value: props.value,
            onChangeText: props.onChange,
            testID: 'auth-text-input',
            placeholder: props.label,
          }),
    );
});

// ----------------------------
// Mock react-native-modal-datetime-picker
// ----------------------------
jest.mock('react-native-modal-datetime-picker', () => {
  const React = require('react');
  const RN = require('react-native');

  return {
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    default: ({ isVisible, onConfirm, onCancel }: any) =>
      isVisible ? React.createElement(RN.View, { testID: 'date-time-picker' }, null) : null,
  };
});

// ----------------------------
// Mock react-native-safe-area-context
// ----------------------------
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// ----------------------------
// Mock useWindowDimensions
// ----------------------------
const mockUseWindowDimensions = jest.fn(() => ({
  width: 390,
  height: 844,
  scale: 1,
  fontScale: 1,
}));

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  default: mockUseWindowDimensions,
  __esModule: true,
}));

// ----------------------------
// Helper to create mocked Animated functions
// ----------------------------
const createMockedAnimation = () => ({
  start: (callback?: (result: { finished: boolean }) => void) => {
    if (callback) callback({ finished: true });
  },
  stop: () => {},
  reset: () => {},
});

// ----------------------------
// Mock React Native Animated APIs
// ----------------------------
jest
  .spyOn(Animated, 'timing')
  .mockImplementation((value: Animated.Value | Animated.ValueXY, config: Animated.TimingAnimationConfig) => {
    (value as any).setValue((config as any).toValue);
    return createMockedAnimation() as unknown as Animated.CompositeAnimation;
  });

jest
  .spyOn(Animated, 'spring')
  .mockImplementation((value: Animated.Value | Animated.ValueXY, config: Animated.SpringAnimationConfig) => {
    (value as any).setValue((config as any).toValue);
    return createMockedAnimation() as unknown as Animated.CompositeAnimation;
  });

jest
  .spyOn(Animated, 'sequence')
  .mockImplementation(() => createMockedAnimation() as unknown as Animated.CompositeAnimation);
jest
  .spyOn(Animated, 'parallel')
  .mockImplementation(() => createMockedAnimation() as unknown as Animated.CompositeAnimation);
jest
  .spyOn(Animated, 'stagger')
  .mockImplementation(() => createMockedAnimation() as unknown as Animated.CompositeAnimation);
jest
  .spyOn(Animated, 'loop')
  .mockImplementation(() => createMockedAnimation() as unknown as Animated.CompositeAnimation);

// ----------------------------
// Suppress specific console warnings during tests
// ----------------------------
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const [message] = args;
    if (
      typeof message === 'string' &&
      (message.includes('Warning: An update to') || message.includes('was not wrapped in act'))
    ) {
      return;
    }
    originalError(...args);
  };

  console.warn = (...args: unknown[]) => {
    const [message] = args;
    if (typeof message === 'string' && (message.includes('Animated:') || message.includes('useNativeDriver'))) {
      return;
    }
    // Don't suppress component error warnings - we want to see them
    originalWarn(...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
