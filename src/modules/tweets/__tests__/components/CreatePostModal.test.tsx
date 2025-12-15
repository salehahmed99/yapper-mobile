import { ThemeProvider } from '@/src/context/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import CreatePostModal from '../../components/CreatePostModal';

// Mock child components
jest.mock('../../components/BottomToolBar', () => 'BottomToolBar');
jest.mock('../../components/CreatePostHeader', () => {
  const { Pressable, Text } = require('react-native');
  return (props: any) => (
    <Pressable onPress={props.handlePost} testID="header-post-button">
      <Text>Post</Text>
    </Pressable>
  );
});
jest.mock('../../components/ReplyRestrictionModal', () => 'ReplyRestrictionModal');
jest.mock('../../components/ReplyRestrictionSelector', () => 'ReplyRestrictionSelector');
jest.mock('../../components/TweetMediaPicker', () => 'TweetMediaPicker');
jest.mock('../../components/ParentTweet', () => 'ParentTweet');
jest.mock('../../components/ParentTweetV2', () => 'ParentTweetV2');
jest.mock('@gorhom/bottom-sheet', () => ({
  BottomSheetModal: 'BottomSheetModal',
  BottomSheetModalProvider: ({ children }: any) => children,
}));
jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('expo-image-picker', () => ({
  getMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: false, assets: [] })),
  getCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  launchCameraAsync: jest.fn(() => Promise.resolve({ canceled: false, assets: [] })),
}));
jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: jest.fn(() => ({ user: { avatarUrl: 'url' } })),
}));

jest.mock('react-native-controlled-mentions', () => ({
  useMentions: jest.fn(({ value, onChange }) => ({
    textInputProps: {
      value,
      onChangeText: onChange,
    },
    triggers: {
      mention: {},
    },
  })),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{component}</ThemeProvider>
    </QueryClientProvider>,
  );
};

describe('CreatePostModal', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    type: 'tweet' as const,
    onPost: jest.fn(),
    onRepost: jest.fn(),
  };

  it('should render correctly', () => {
    const { getByTestId } = renderWithTheme(<CreatePostModal {...defaultProps} />);
    expect(getByTestId('create_post_text_input')).toBeTruthy();
  });

  it('should handle text input', () => {
    const { getByTestId } = renderWithTheme(<CreatePostModal {...defaultProps} />);
    fireEvent.changeText(getByTestId('create_post_text_input'), 'Hello world');
    expect(getByTestId('create_post_text_input').props.value).toBe('Hello world');
  });

  it('should handle post', () => {
    const { getByTestId } = renderWithTheme(<CreatePostModal {...defaultProps} />);
    fireEvent.changeText(getByTestId('create_post_text_input'), 'Hello world');
    fireEvent.press(getByTestId('header-post-button'));
    expect(defaultProps.onPost).toHaveBeenCalledWith('Hello world', []);
  });
});
