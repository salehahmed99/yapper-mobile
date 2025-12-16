import { ThemeProvider } from '@/src/context/ThemeContext';
import MessagesList from '@/src/modules/chat/components/MessagesList';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

// Mocks
jest.mock('@shopify/flash-list', () => {
  const { View } = require('react-native');
  return {
    FlashList: ({
      data,
      renderItem,
      ListEmptyComponent,
    }: {
      data: any[];
      renderItem: any;
      ListEmptyComponent: any;
    }) => (
      <>
        <View testID="flash-list-mock">
          {data.map((item) => (
            <View key={item.id}>{renderItem({ item })}</View>
          ))}
        </View>
        {data.length === 0 && ListEmptyComponent && ListEmptyComponent()}
      </>
    ),
  };
});

jest.mock('@/src/modules/chat/components/MessageItem', () => {
  const { Text, View } = require('react-native');
  return ({ chat }: { chat: any }) => (
    <View testID={`message_item_${chat.id}`}>
      <Text>{chat.lastMessage?.content}</Text>
    </View>
  );
});

jest.mock('@/src/modules/chat/components/MessagesEmptyState', () => {
  const { Text } = require('react-native');
  return () => <Text testID="empty-state">Empty State</Text>;
});

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('MessagesList', () => {
  const mockChats = [
    { id: '1', lastMessage: { content: 'Hi' }, participant: { id: 'u1' } },
    { id: '2', lastMessage: { content: 'Hello' }, participant: { id: 'u2' } },
  ];

  it('should render chats', () => {
    renderWithTheme(<MessagesList chats={mockChats as any[]} />);
    expect(screen.getByText('Hi')).toBeTruthy();
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('should render empty state when no chats', () => {
    renderWithTheme(<MessagesList chats={[]} />);
    expect(screen.getByTestId('empty-state')).toBeTruthy();
  });
});
