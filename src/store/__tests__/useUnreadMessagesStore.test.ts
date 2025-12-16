import { act, renderHook } from '@testing-library/react-native';
import { useUnreadMessagesStore } from '../useUnreadMessagesStore';

describe('useUnreadMessagesStore', () => {
  beforeEach(() => {
    useUnreadMessagesStore.setState({
      unreadChatIds: new Set(),
      activeChatId: null,
    });
  });

  describe('initial state', () => {
    it('should have empty unread chats', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      expect(result.current.unreadChatIds).toEqual(new Set());
      expect(result.current.getUnreadCount()).toBe(0);
    });

    it('should have null active chat', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      expect(result.current.activeChatId).toBeNull();
    });
  });

  describe('setUnreadChatIds', () => {
    it('should set unread chat IDs from array', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.setUnreadChatIds(['chat1', 'chat2', 'chat3']);
      });

      expect(result.current.unreadChatIds).toEqual(new Set(['chat1', 'chat2', 'chat3']));
    });

    it('should replace previous unread chats', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.setUnreadChatIds(['chat1', 'chat2']);
        result.current.setUnreadChatIds(['chat3', 'chat4']);
      });

      expect(result.current.unreadChatIds).toEqual(new Set(['chat3', 'chat4']));
    });

    it('should handle empty array', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.setUnreadChatIds(['chat1']);
        result.current.setUnreadChatIds([]);
      });

      expect(result.current.unreadChatIds).toEqual(new Set());
    });

    it('should handle duplicates in input array', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.setUnreadChatIds(['chat1', 'chat2', 'chat1']);
      });

      expect(result.current.unreadChatIds).toEqual(new Set(['chat1', 'chat2']));
    });

    it('should handle many chat IDs', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());
      const chatIds = Array.from({ length: 100 }, (_, i) => `chat${i}`);

      act(() => {
        result.current.setUnreadChatIds(chatIds);
      });

      expect(result.current.unreadChatIds.size).toBe(100);
    });
  });

  describe('addUnreadChat', () => {
    it('should add a new unread chat', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.addUnreadChat('chat1');
      });

      expect(result.current.unreadChatIds).toEqual(new Set(['chat1']));
    });

    it('should add multiple chats', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.addUnreadChat('chat1');
        result.current.addUnreadChat('chat2');
        result.current.addUnreadChat('chat3');
      });

      expect(result.current.unreadChatIds).toEqual(new Set(['chat1', 'chat2', 'chat3']));
    });

    it('should not duplicate existing chat', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.addUnreadChat('chat1');
        result.current.addUnreadChat('chat1');
      });

      expect(result.current.unreadChatIds).toEqual(new Set(['chat1']));
      expect(result.current.getUnreadCount()).toBe(1);
    });

    it('should add to existing chats', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.setUnreadChatIds(['chat1', 'chat2']);
        result.current.addUnreadChat('chat3');
      });

      expect(result.current.unreadChatIds).toEqual(new Set(['chat1', 'chat2', 'chat3']));
    });

    it('should handle numeric chat IDs as strings', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.addUnreadChat('123');
        result.current.addUnreadChat('456');
      });

      expect(result.current.unreadChatIds).toEqual(new Set(['123', '456']));
    });
  });

  describe('removeUnreadChat', () => {
    it('should remove an unread chat', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.setUnreadChatIds(['chat1', 'chat2', 'chat3']);
        result.current.removeUnreadChat('chat2');
      });

      expect(result.current.unreadChatIds).toEqual(new Set(['chat1', 'chat3']));
    });

    it('should handle removing non-existent chat', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.setUnreadChatIds(['chat1', 'chat2']);
        result.current.removeUnreadChat('chat99');
      });

      expect(result.current.unreadChatIds).toEqual(new Set(['chat1', 'chat2']));
    });

    it('should remove all chats one by one', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.setUnreadChatIds(['chat1', 'chat2', 'chat3']);
        result.current.removeUnreadChat('chat1');
        result.current.removeUnreadChat('chat2');
        result.current.removeUnreadChat('chat3');
      });

      expect(result.current.unreadChatIds).toEqual(new Set());
    });

    it('should update count after removal', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.setUnreadChatIds(['chat1', 'chat2', 'chat3']);
      });

      expect(result.current.getUnreadCount()).toBe(3);

      act(() => {
        result.current.removeUnreadChat('chat1');
      });

      expect(result.current.getUnreadCount()).toBe(2);
    });
  });

  describe('clearUnreadChats', () => {
    it('should clear all unread chats', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.setUnreadChatIds(['chat1', 'chat2', 'chat3']);
        result.current.clearUnreadChats();
      });

      expect(result.current.unreadChatIds).toEqual(new Set());
    });

    it('should reset count to zero', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.setUnreadChatIds(['chat1', 'chat2']);
        expect(result.current.getUnreadCount()).toBe(2);
        result.current.clearUnreadChats();
      });

      expect(result.current.getUnreadCount()).toBe(0);
    });

    it('should allow adding chats after clearing', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.setUnreadChatIds(['chat1', 'chat2']);
        result.current.clearUnreadChats();
        result.current.addUnreadChat('chat3');
      });

      expect(result.current.unreadChatIds).toEqual(new Set(['chat3']));
    });

    it('should handle clearing empty set', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.clearUnreadChats();
      });

      expect(result.current.unreadChatIds).toEqual(new Set());
    });
  });

  describe('setActiveChatId', () => {
    it('should set active chat ID', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.setActiveChatId('chat1');
      });

      expect(result.current.activeChatId).toBe('chat1');
    });

    it('should update active chat ID', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.setActiveChatId('chat1');
        result.current.setActiveChatId('chat2');
      });

      expect(result.current.activeChatId).toBe('chat2');
    });

    it('should set active chat to null', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.setActiveChatId('chat1');
        result.current.setActiveChatId(null);
      });

      expect(result.current.activeChatId).toBeNull();
    });

    it('should handle same ID set multiple times', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.setActiveChatId('chat1');
        result.current.setActiveChatId('chat1');
        result.current.setActiveChatId('chat1');
      });

      expect(result.current.activeChatId).toBe('chat1');
    });

    it('should not affect unread chats', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.setUnreadChatIds(['chat1', 'chat2']);
        result.current.setActiveChatId('chat1');
      });

      expect(result.current.unreadChatIds).toEqual(new Set(['chat1', 'chat2']));
    });
  });

  describe('getUnreadCount', () => {
    it('should return 0 for empty set', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      expect(result.current.getUnreadCount()).toBe(0);
    });

    it('should return correct count', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.setUnreadChatIds(['chat1', 'chat2', 'chat3']);
      });

      expect(result.current.getUnreadCount()).toBe(3);
    });

    it('should update count after adding chat', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.addUnreadChat('chat1');
        result.current.addUnreadChat('chat2');
      });

      expect(result.current.getUnreadCount()).toBe(2);

      act(() => {
        result.current.addUnreadChat('chat3');
      });

      expect(result.current.getUnreadCount()).toBe(3);
    });

    it('should update count after removing chat', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.setUnreadChatIds(['chat1', 'chat2', 'chat3']);
      });

      expect(result.current.getUnreadCount()).toBe(3);

      act(() => {
        result.current.removeUnreadChat('chat1');
      });

      expect(result.current.getUnreadCount()).toBe(2);
    });

    it('should return 0 after clearing', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.setUnreadChatIds(['chat1', 'chat2']);
        result.current.clearUnreadChats();
      });

      expect(result.current.getUnreadCount()).toBe(0);
    });
  });

  describe('combined operations', () => {
    it('should handle complex workflow', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.setUnreadChatIds(['chat1', 'chat2']);
        expect(result.current.getUnreadCount()).toBe(2);

        result.current.addUnreadChat('chat3');
        expect(result.current.getUnreadCount()).toBe(3);

        result.current.setActiveChatId('chat1');
        result.current.removeUnreadChat('chat1');
        expect(result.current.getUnreadCount()).toBe(2);

        result.current.setActiveChatId(null);
        result.current.clearUnreadChats();
        expect(result.current.getUnreadCount()).toBe(0);
      });

      expect(result.current.unreadChatIds).toEqual(new Set());
      expect(result.current.activeChatId).toBeNull();
    });

    it('should maintain separate unread and active state', () => {
      const { result } = renderHook(() => useUnreadMessagesStore());

      act(() => {
        result.current.setUnreadChatIds(['chat1', 'chat2', 'chat3']);
        result.current.setActiveChatId('chat1');
      });

      expect(result.current.unreadChatIds.has('chat1')).toBe(true);
      expect(result.current.activeChatId).toBe('chat1');

      // Remove chat1 from unread
      act(() => {
        result.current.removeUnreadChat('chat1');
      });

      expect(result.current.unreadChatIds.has('chat1')).toBe(false);
      expect(result.current.activeChatId).toBe('chat1');
    });
  });
});
