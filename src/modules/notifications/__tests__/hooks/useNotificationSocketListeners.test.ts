import { useNotificationStore } from '@/src/store/useNotificationStore';
import { useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import { useNotificationSocketListeners } from '../../hooks/useNotificationSocketListeners';
import { notificationSocketService } from '../../services/notificationSocketService';

// Mock the notification socket service
jest.mock('../../services/notificationSocketService', () => ({
  notificationSocketService: {
    onNewestCount: jest.fn(),
    onFollow: jest.fn(),
    onLike: jest.fn(),
    onReply: jest.fn(),
    onRepost: jest.fn(),
    onQuote: jest.fn(),
    onMention: jest.fn(),
    offNewestCount: jest.fn(),
    offFollow: jest.fn(),
    offLike: jest.fn(),
    offReply: jest.fn(),
    offRepost: jest.fn(),
    offQuote: jest.fn(),
    offMention: jest.fn(),
  },
}));

// Mock react-query
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));

// Mock the notification store
jest.mock('@/src/store/useNotificationStore', () => ({
  useNotificationStore: jest.fn((selector: any) => {
    const state = {
      setUnreadCount: jest.fn(),
      incrementUnreadCount: jest.fn(),
    };
    return selector(state);
  }),
}));

describe('useNotificationSocketListeners', () => {
  let mockQueryClient: any;
  let mockSetUnreadCount: jest.Mock;
  let mockIncrementUnreadCount: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSetUnreadCount = jest.fn();
    mockIncrementUnreadCount = jest.fn();

    mockQueryClient = {
      invalidateQueries: jest.fn(),
    };

    (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
    (useNotificationStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        setUnreadCount: mockSetUnreadCount,
        incrementUnreadCount: mockIncrementUnreadCount,
      };
      return selector(state);
    });
  });

  it('should register all socket listeners on mount', () => {
    renderHook(() => useNotificationSocketListeners());

    expect(notificationSocketService.onNewestCount).toHaveBeenCalled();
    expect(notificationSocketService.onFollow).toHaveBeenCalled();
    expect(notificationSocketService.onLike).toHaveBeenCalled();
    expect(notificationSocketService.onReply).toHaveBeenCalled();
    expect(notificationSocketService.onRepost).toHaveBeenCalled();
    expect(notificationSocketService.onQuote).toHaveBeenCalled();
    expect(notificationSocketService.onMention).toHaveBeenCalled();
  });

  it('should unregister all socket listeners on unmount', () => {
    const { unmount } = renderHook(() => useNotificationSocketListeners());

    unmount();

    expect(notificationSocketService.offNewestCount).toHaveBeenCalled();
    expect(notificationSocketService.offFollow).toHaveBeenCalled();
    expect(notificationSocketService.offLike).toHaveBeenCalled();
    expect(notificationSocketService.offReply).toHaveBeenCalled();
    expect(notificationSocketService.offRepost).toHaveBeenCalled();
    expect(notificationSocketService.offQuote).toHaveBeenCalled();
    expect(notificationSocketService.offMention).toHaveBeenCalled();
  });

  it('should handle newest count updates', () => {
    const handler = (notificationSocketService.onNewestCount as jest.Mock).mock.calls[0][0];
    handler({ newest_count: 5 });

    expect(mockSetUnreadCount).toHaveBeenCalledWith(5);
  });

  it('should handle follow notification with add action', () => {
    renderHook(() => useNotificationSocketListeners());

    const handler = (notificationSocketService.onFollow as jest.Mock).mock.calls[0][0];
    handler({ action: 'add', user_id: '123' });

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['notifications'],
    });
    expect(mockIncrementUnreadCount).toHaveBeenCalled();
  });

  it('should handle follow notification with aggregate action', () => {
    renderHook(() => useNotificationSocketListeners());

    const handler = (notificationSocketService.onFollow as jest.Mock).mock.calls[0][0];
    handler({ action: 'aggregate', count: 3 });

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['notifications'],
    });
    expect(mockIncrementUnreadCount).toHaveBeenCalled();
  });

  it('should not increment unread count for follow notification with remove action', () => {
    renderHook(() => useNotificationSocketListeners());

    mockIncrementUnreadCount.mockClear();
    mockQueryClient.invalidateQueries.mockClear();

    const handler = (notificationSocketService.onFollow as jest.Mock).mock.calls[0][0];
    handler({ action: 'remove' });

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalled();
    expect(mockIncrementUnreadCount).not.toHaveBeenCalled();
  });

  it('should handle like notification with add action', () => {
    renderHook(() => useNotificationSocketListeners());

    const handler = (notificationSocketService.onLike as jest.Mock).mock.calls[0][0];
    handler({ action: 'add', tweet_id: 'tweet123' });

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalled();
    expect(mockIncrementUnreadCount).toHaveBeenCalled();
  });

  it('should handle reply notification with add action', () => {
    renderHook(() => useNotificationSocketListeners());

    const handler = (notificationSocketService.onReply as jest.Mock).mock.calls[0][0];
    handler({ action: 'add', tweet_id: 'tweet123' });

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalled();
    expect(mockIncrementUnreadCount).toHaveBeenCalled();
  });

  it('should not increment unread count for reply notification with non-add action', () => {
    renderHook(() => useNotificationSocketListeners());

    mockIncrementUnreadCount.mockClear();

    const handler = (notificationSocketService.onReply as jest.Mock).mock.calls[0][0];
    handler({ action: 'aggregate' });

    expect(mockIncrementUnreadCount).not.toHaveBeenCalled();
  });

  it('should handle repost notification with add action', () => {
    renderHook(() => useNotificationSocketListeners());

    const handler = (notificationSocketService.onRepost as jest.Mock).mock.calls[0][0];
    handler({ action: 'add', tweet_id: 'tweet123' });

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalled();
    expect(mockIncrementUnreadCount).toHaveBeenCalled();
  });

  it('should handle quote notification with add action', () => {
    renderHook(() => useNotificationSocketListeners());

    const handler = (notificationSocketService.onQuote as jest.Mock).mock.calls[0][0];
    handler({ action: 'add', tweet_id: 'tweet123' });

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalled();
    expect(mockIncrementUnreadCount).toHaveBeenCalled();
  });

  it('should not increment unread count for quote notification with non-add action', () => {
    renderHook(() => useNotificationSocketListeners());

    mockIncrementUnreadCount.mockClear();

    const handler = (notificationSocketService.onQuote as jest.Mock).mock.calls[0][0];
    handler({ action: 'aggregate' });

    expect(mockIncrementUnreadCount).not.toHaveBeenCalled();
  });

  it('should handle mention notification with add action', () => {
    renderHook(() => useNotificationSocketListeners());

    const handler = (notificationSocketService.onMention as jest.Mock).mock.calls[0][0];
    handler({ action: 'add', tweet_id: 'tweet123' });

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalled();
    expect(mockIncrementUnreadCount).toHaveBeenCalled();
  });

  it('should not increment unread count for mention notification with non-add action', () => {
    renderHook(() => useNotificationSocketListeners());

    mockIncrementUnreadCount.mockClear();

    const handler = (notificationSocketService.onMention as jest.Mock).mock.calls[0][0];
    handler({ action: 'aggregate' });

    expect(mockIncrementUnreadCount).not.toHaveBeenCalled();
  });

  it('should handle multiple notifications in sequence', () => {
    renderHook(() => useNotificationSocketListeners());

    const handleFollow = (notificationSocketService.onFollow as jest.Mock).mock.calls[0][0];
    const handleLike = (notificationSocketService.onLike as jest.Mock).mock.calls[0][0];
    const handleNewestCount = (notificationSocketService.onNewestCount as jest.Mock).mock.calls[0][0];

    handleFollow({ action: 'add', user_id: '1' });
    handleLike({ action: 'add', tweet_id: 'tweet1' });
    handleNewestCount({ newest_count: 10 });

    expect(mockIncrementUnreadCount).toHaveBeenCalledTimes(2);
    expect(mockSetUnreadCount).toHaveBeenCalledWith(10);
  });
});
