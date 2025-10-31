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
// Mock expo-secure-store
// ----------------------------
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// ----------------------------
// Mock react-native-safe-area-context
// ----------------------------
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
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
    originalWarn(...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
