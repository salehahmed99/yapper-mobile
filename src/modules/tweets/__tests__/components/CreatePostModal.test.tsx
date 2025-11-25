import { ThemeProvider } from '@/src/context/ThemeContext';
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
jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: jest.fn(() => ({ user: { avatarUrl: 'url' } })),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
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
