/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/react-native';
import dotenv from 'dotenv';
import path from 'path';
import { Animated } from 'react-native';
import 'react-native-gesture-handler/jestSetup';

// ----------------------------
// Mock react-native-gesture-handler manually to avoid I18nManager issues
// ----------------------------
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    /* Buttons */
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    /* Other */
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
  };
});

// Load environment variables from .env file
dotenv.config({
  path: path.resolve(__dirname, '.env'),
  override: false, // keep existing process.env values
});

// ----------------------------
// Mock React Native with I18nManager override
// ----------------------------
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  const mockFindNodeHandle = jest.fn();

  // Create stable mocks to ensure the same instance is used across imports
  const mockI18nManager = {
    isRTL: false,
    allowRTL: jest.fn(),
    forceRTL: jest.fn(),
    doLeftAndRightSwapInRTL: true,
    getConstants: () => ({
      isRTL: false,
      doLeftAndRightSwapInRTL: true,
      localeIdentifier: 'en_US',
    }),
  };

  Object.defineProperty(RN, 'I18nManager', {
    get: () => mockI18nManager,
  });

  const mockUIManager = {
    ...RN.UIManager,
    measureInWindow: jest.fn(),
  };

  /* Create stable mocks */
  const mockActionSheetIOS = {
    showActionSheetWithOptions: jest.fn(),
  };

  // Use Proxy to intercept specific properties while forwarding everything else
  // This avoids eager loading (Stack Overflow from spread) and mutation issues
  return new Proxy(RN, {
    get: (target, prop) => {
      if (prop === 'I18nManager') return mockI18nManager;
      if (prop === 'findNodeHandle') return mockFindNodeHandle;
      if (prop === 'UIManager') return mockUIManager;
      if (prop === 'Modal') return require('react-native/Libraries/Modal/Modal');
      if (prop === 'Alert') return require('react-native/Libraries/Alert/Alert');
      if (prop === 'ActionSheetIOS') return mockActionSheetIOS;
      return target[prop as keyof typeof RN];
    },
  });
});

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
  checkAutomatically: 'ON_LOAD',
  fetchUpdateAsync: jest.fn(),
  checkForUpdateAsync: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
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
    setParams: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
    setParams: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useGlobalSearchParams: () => ({}),
  useSegments: () => [],
  usePathname: () => '/',
  useFocusEffect: jest.fn((callback: () => void) => {
    // Call the callback immediately in tests
    if (callback) callback();
  }),
  Link: 'Link',
  Stack: ({ children }: any) => children,
  Tabs: ({ children }: any) => children,
  Slot: ({ children }: any) => children,
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
  isInitialized: true,
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
  const { View } = require('react-native');

  const MockModal = ({ children, visible }: { children: React.ReactNode; visible: boolean }) =>
    visible ? React.createElement(View, { testID: 'mock-modal' }, children) : null;
  return MockModal;
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
// Mock expo-auth-session
// ----------------------------
jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn().mockReturnValue('exp://localhost:19000'),
  useAuthRequest: jest.fn(() => [null, { type: 'success', params: { code: 'test-code' } }, jest.fn()]),
  exchangeCodeAsync: jest.fn(),
  fetchUserInfoAsync: jest.fn(),
}));

// ----------------------------
// Mock expo-web-browser
// ----------------------------
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock findNodeHandle - removed as it's handled in the main react-native mock now
// jest.mock('react-native/Libraries/Renderer/shims/ReactNative', ...);

// ----------------------------
// Mock @expo/vector-icons
// ----------------------------
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const RN = require('react-native');

  const MockIcon = (props: any) => React.createElement(RN.View, { testID: props.testID || 'mock-icon', ...props });

  return {
    Ionicons: MockIcon,
    MaterialCommunityIcons: MockIcon,
    FontAwesome: MockIcon,
    FontAwesome5: MockIcon,
    Feather: MockIcon,
    AntDesign: MockIcon,
    Entypo: MockIcon,
    MaterialIcons: MockIcon,
  };
});

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
    User: MockIcon,
    Settings: MockIcon,
    LogOut: MockIcon,
    Camera: MockIcon,
    Image: MockIcon,
    Mic: MockIcon,
    Send: MockIcon,
    MoreHorizontal: MockIcon,
    MoreVertical: MockIcon,
    Edit: MockIcon,
    Trash: MockIcon,
    Search: MockIcon,
    Home: MockIcon,
    Bell: MockIcon,
    MessageCircle: MockIcon,
    Bookmark: MockIcon,
    Share: MockIcon,
    Heart: MockIcon,
    Repeat: MockIcon,
    MessageSquare: MockIcon,
    Smile: MockIcon,
    Plus: MockIcon,
    HelpCircle: MockIcon,
    MoonStar: MockIcon,
    Trash2: MockIcon,
    Mail: MockIcon,
    ArrowLeft: MockIcon,
    Info: MockIcon,
    MailPlus: MockIcon,
    SettingsIcon: MockIcon,
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
// Mock expo-haptics
// ----------------------------
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// ----------------------------
// Mock expo-image-picker (Global)
// ----------------------------
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: true, assets: [] })),
  launchCameraAsync: jest.fn(() => Promise.resolve({ canceled: true, assets: [] })),
  getMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  MediaTypeOptions: {
    Images: 'Images',
    Videos: 'Videos',
    All: 'All',
  },
}));

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
