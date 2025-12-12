import MessagesPage from '@/app/(protected)/messages/index';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { useInfiniteQuery } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

// Mocks
jest.mock('@/src/components/shell/AppBar', () => {
  const { View } = require('react-native');
  return ({ children }: any) => <View testID="app_bar">{children}</View>;
});

jest.mock('@/src/modules/chat/components/MessagesList', () => {
  const { View, Text } = require('react-native');
  return ({ chats }: any) => (
    <View testID="messages_list">
      <Text>Count: {chats.length}</Text>
    </View>
  );
});

jest.mock('@/src/modules/chat/components/NewMessageModal', () => {
  const { View } = require('react-native');
  return () => <View testID="new_message_modal" />;
});

jest.mock('@/src/modules/chat/services/chatService', () => ({
  getChats: jest.fn(),
}));

jest.mock('@/src/modules/chat/services/chatSocketService', () => ({
  chatSocketService: {
    onNewMessage: jest.fn(),
    onUnreadChatsSummary: jest.fn(),
    offNewMessage: jest.fn(),
    offUnreadChatsSummary: jest.fn(),
  },
}));

jest.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: jest.fn(),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('MessagesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useInfiniteQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
    });
  });

  it('should render page', () => {
    renderWithTheme(<MessagesPage />);
    expect(screen.getByTestId('app_bar')).toBeTruthy();
  });

  it('should render messages list with data', () => {
    (useInfiniteQuery as jest.Mock).mockReturnValue({
      data: { pages: [{ chats: [1, 2] }] },
      isLoading: false,
    });
    renderWithTheme(<MessagesPage />);
    expect(screen.getByTestId('messages_list')).toBeTruthy();
    expect(screen.getByText('Count: 2')).toBeTruthy();
  });
});
