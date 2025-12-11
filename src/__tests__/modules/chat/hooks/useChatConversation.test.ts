import { useChatConversation } from '@/src/modules/chat/hooks/useChatConversation';
import { chatSocketService } from '@/src/modules/chat/services/chatSocketService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useUnreadMessagesStore } from '@/src/store/useUnreadMessagesStore';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';

// Mock Dependencies
jest.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('@/src/modules/chat/services/chatSocketService', () => ({
  chatSocketService: {
    joinChat: jest.fn(),
    leaveChat: jest.fn(),
    sendMessage: jest.fn(),
    startTyping: jest.fn(),
    stopTyping: jest.fn(),
    addReaction: jest.fn(),
    removeReaction: jest.fn(),
    onNewMessage: jest.fn(),
    offNewMessage: jest.fn(),
    onMessageSent: jest.fn(),
    offMessageSent: jest.fn(),
    onUserTyping: jest.fn(),
    offUserTyping: jest.fn(),
    onUserStoppedTyping: jest.fn(),
    offUserStoppedTyping: jest.fn(),
    onReactionAdded: jest.fn(),
    offReactionAdded: jest.fn(),
    onReactionRemoved: jest.fn(),
    offReactionRemoved: jest.fn(),
  },
}));

jest.mock('@/src/modules/chat/services/chatService', () => ({
  getMessages: jest.fn(),
}));

jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/src/store/useUnreadMessagesStore', () => ({
  useUnreadMessagesStore: jest.fn(),
}));

describe('useChatConversation', () => {
  let mockSetQueryData: jest.Mock;
  let mockInvalidateQueries: jest.Mock;
  let mockRemoveUnreadChat: jest.Mock;
  let mockSetActiveChatId: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSetQueryData = jest.fn();
    mockInvalidateQueries = jest.fn();
    mockRemoveUnreadChat = jest.fn();
    mockSetActiveChatId = jest.fn();

    (useQueryClient as jest.Mock).mockReturnValue({
      setQueryData: mockSetQueryData,
      invalidateQueries: mockInvalidateQueries,
      getQueryData: jest.fn(),
    });

    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) => {
      return selector({ user: { id: 'currentUser' } });
    });

    (useUnreadMessagesStore as unknown as jest.Mock).mockImplementation((selector) => {
      return selector({
        removeUnreadChat: mockRemoveUnreadChat,
        setActiveChatId: mockSetActiveChatId,
      });
    });

    // Default infinite query mock
    (useInfiniteQuery as jest.Mock).mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      isError: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });
  });

  const CHAT_ID = 'chat-123';

  it('should join chat on mount and leave on unmount', () => {
    const { unmount } = renderHook(() => useChatConversation({ chatId: CHAT_ID }));

    expect(chatSocketService.joinChat).toHaveBeenCalledWith(CHAT_ID);
    expect(mockSetActiveChatId).toHaveBeenCalledWith(CHAT_ID);
    expect(mockRemoveUnreadChat).toHaveBeenCalledWith(CHAT_ID);

    unmount();

    expect(chatSocketService.leaveChat).toHaveBeenCalledWith(CHAT_ID);
    expect(mockSetActiveChatId).toHaveBeenCalledWith(null);
  });

  it('should load messages and format them', () => {
    (useInfiniteQuery as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            messages: [
              { id: '1', content: 'hello' },
              { id: '2', content: 'world' },
            ],
            sender: { id: 'sender' },
          },
        ],
      },
      isLoading: false,
    });

    const { result } = renderHook(() => useChatConversation({ chatId: CHAT_ID }));

    // Messages are reversed in the hook
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].content).toBe('hello');
  });

  it('should handle text input changes and emit typing events', () => {
    const { result } = renderHook(() => useChatConversation({ chatId: CHAT_ID }));

    act(() => {
      result.current.handleTextChange('a');
    });

    expect(result.current.inputText).toBe('a');
    expect(chatSocketService.startTyping).toHaveBeenCalledWith(CHAT_ID);

    act(() => {
      result.current.handleTextChange('');
    });

    expect(result.current.inputText).toBe('');
    expect(chatSocketService.stopTyping).toHaveBeenCalledWith(CHAT_ID);
  });

  it('should send message', () => {
    const { result } = renderHook(() => useChatConversation({ chatId: CHAT_ID }));

    act(() => {
      result.current.handleTextChange('Hello');
    });

    act(() => {
      result.current.handleSend();
    });

    expect(chatSocketService.sendMessage).toHaveBeenCalledWith(CHAT_ID, 'Hello', 'text', null, null, true);
    expect(result.current.inputText).toBe(''); // Should clear input
  });

  it('should handle other user typing', () => {
    const { result } = renderHook(() => useChatConversation({ chatId: CHAT_ID }));

    // Grab the listener passed to onUserTyping
    const onUserTypingCallback = (chatSocketService.onUserTyping as jest.Mock).mock.calls[0][0];

    act(() => {
      onUserTypingCallback({ chat_id: CHAT_ID, user_id: 'otherUser' });
    });

    expect(result.current.isOtherUserTyping).toBe(true);
  });

  it('should handle reaction', () => {
    const { result } = renderHook(() => useChatConversation({ chatId: CHAT_ID }));

    act(() => {
      result.current.handleReactToMessage('msg1', '👍');
    });

    expect(chatSocketService.addReaction).toHaveBeenCalledWith(CHAT_ID, 'msg1', '👍');
  });

  it('should handle remove reaction', () => {
    const { result } = renderHook(() => useChatConversation({ chatId: CHAT_ID }));
    act(() => {
      result.current.handleRemoveReactToMessage('msg1', '👍');
    });
    expect(chatSocketService.removeReaction).toHaveBeenCalledWith(CHAT_ID, 'msg1', '👍');
  });

  it('should handle replying state', () => {
    const { result } = renderHook(() => useChatConversation({ chatId: CHAT_ID }));
    const msg = { id: '1', content: 'reply to me', senderId: 'u1' } as any;

    act(() => {
      result.current.handleReplyToMessage(msg, 'User 1');
    });
    expect(result.current.replyingTo).toEqual({
      messageId: '1',
      content: 'reply to me',
      senderName: 'User 1',
      hasImage: false,
    });

    act(() => {
      result.current.handleCancelReply();
    });
    expect(result.current.replyingTo).toBeNull();
  });

  it('should load more messages', () => {
    const fetchNextPage = jest.fn();
    (useInfiniteQuery as jest.Mock).mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage,
    });

    const { result } = renderHook(() => useChatConversation({ chatId: CHAT_ID }));

    act(() => {
      result.current.handleLoadMore();
    });
    expect(fetchNextPage).toHaveBeenCalled();
  });
});
