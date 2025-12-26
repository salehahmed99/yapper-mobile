import { useChatSocketListeners } from '@/src/modules/chat/hooks/useChatSocketListeners';
import { chatSocketService } from '@/src/modules/chat/services/chatSocketService';
import { useUnreadMessagesStore } from '@/src/store/useUnreadMessagesStore';
import { useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';

// Mock dependencies
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));

jest.mock('@/src/modules/chat/services/chatSocketService', () => ({
  chatSocketService: {
    onUnreadChatsSummary: jest.fn(),
    onNewMessage: jest.fn(),
    offUnreadChatsSummary: jest.fn(),
    offNewMessage: jest.fn(),
  },
}));

jest.mock('@/src/store/useUnreadMessagesStore', () => ({
  useUnreadMessagesStore: jest.fn(),
}));

describe('useChatSocketListeners', () => {
  let mockSetUnreadChatIds: jest.Mock;
  let mockAddUnreadChat: jest.Mock;
  let mockSetQueryData: jest.Mock;
  let mockInvalidateQueries: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSetUnreadChatIds = jest.fn();
    mockAddUnreadChat = jest.fn();
    mockSetQueryData = jest.fn();
    mockInvalidateQueries = jest.fn();

    (useUnreadMessagesStore as unknown as jest.Mock).mockImplementation((selector) => {
      // Mock store state/actions
      const state = {
        setUnreadChatIds: mockSetUnreadChatIds,
        addUnreadChat: mockAddUnreadChat,
        activeChatId: null, // Default inactive
      };
      return selector(state);
    });

    (useQueryClient as jest.Mock).mockReturnValue({
      setQueryData: mockSetQueryData,
      invalidateQueries: mockInvalidateQueries,
    });
  });

  it('should subscribe and unsubscribe to socket events', () => {
    const { unmount } = renderHook(() => useChatSocketListeners());

    expect(chatSocketService.onUnreadChatsSummary).toHaveBeenCalled();
    expect(chatSocketService.onNewMessage).toHaveBeenCalled();

    unmount();

    expect(chatSocketService.offUnreadChatsSummary).toHaveBeenCalled();
    expect(chatSocketService.offNewMessage).toHaveBeenCalled();
  });

  it('should handle unread chats summary', () => {
    renderHook(() => useChatSocketListeners());

    // Get the callback passed to onUnreadChatsSummary
    const callback = (chatSocketService.onUnreadChatsSummary as jest.Mock).mock.calls[0][0];

    callback({
      chats: [
        { chat_id: '1', unread_count: 5 },
        { chat_id: '2', unread_count: 0 },
      ],
    });

    expect(mockSetUnreadChatIds).toHaveBeenCalledWith(['1']);
  });

  it('should handle new message when NOT viewing chat', () => {
    renderHook(() => useChatSocketListeners());

    const callback = (chatSocketService.onNewMessage as jest.Mock).mock.calls[0][0];
    const messageData = {
      chat_id: '1',
      message: { id: 'm1', content: 'hi', sender_id: 'u2', created_at: '2023' },
    };

    callback(messageData);

    expect(mockAddUnreadChat).toHaveBeenCalledWith('1');
    expect(mockSetQueryData).toHaveBeenCalledWith(['chats'], expect.any(Function));
  });

  it('should handle new message when VIEWING chat', () => {
    (useUnreadMessagesStore as unknown as jest.Mock).mockImplementation((selector) => {
      return selector({
        setUnreadChatIds: mockSetUnreadChatIds,
        addUnreadChat: mockAddUnreadChat,
        activeChatId: '1', // Active chat is same as new message
      });
    });

    renderHook(() => useChatSocketListeners());

    const callback = (chatSocketService.onNewMessage as jest.Mock).mock.calls[0][0];
    const messageData = {
      chat_id: '1', // Same as active
      message: { id: 'm1', content: 'hi', sender_id: 'u2', created_at: '2023' },
    };

    callback(messageData);

    expect(mockAddUnreadChat).not.toHaveBeenCalled();
    expect(mockSetQueryData).toHaveBeenCalled();
  });
});
