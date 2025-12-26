import ChatConversationPage from '@/app/(protected)/messages/[id]';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { useChatConversation } from '@/src/modules/chat/hooks/useChatConversation';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

// Mocks
jest.mock('@/src/modules/chat/hooks/useChatConversation', () => ({
  useChatConversation: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'c1', name: 'User 1' }),
  useRouter: () => ({ back: jest.fn() }),
}));

jest.mock('@/src/modules/chat/components/ChatHeader', () => {
  const { View, Text } = require('react-native');
  return ({ name }: any) => (
    <View testID="chat_header">
      <Text>{name}</Text>
    </View>
  );
});

jest.mock('@/src/modules/chat/components/ChatMessagesList', () => {
  const { View } = require('react-native');
  return () => <View testID="chat_messages_list" />;
});

jest.mock('@/src/modules/chat/components/ChatInput', () => {
  const { View } = require('react-native');
  return () => <View testID="chat_input" />;
});

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ resetQueries: jest.fn(), invalidateQueries: jest.fn() }),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ChatConversationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useChatConversation as jest.Mock).mockReturnValue({
      messages: [],
      isLoading: false,
      inputText: '',
      handleTextChange: jest.fn(),
      isKeyboardVisible: false,
    });
  });

  it('should render header and components', () => {
    renderWithTheme(<ChatConversationPage />);
    expect(screen.getByTestId('chat_header')).toBeTruthy();
    expect(screen.getByText('User 1')).toBeTruthy();
    expect(screen.getByTestId('chat_messages_list')).toBeTruthy();
    expect(screen.getByTestId('chat_input')).toBeTruthy();
  });

  it('should show loading state', () => {
    (useChatConversation as jest.Mock).mockReturnValue({
      isLoading: true,
      messages: [],
    });
    renderWithTheme(<ChatConversationPage />);
    expect(screen.getByTestId('chat_loading_indicator')).toBeTruthy();
  });
});
