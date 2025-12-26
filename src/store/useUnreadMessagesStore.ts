import { create } from 'zustand';

interface IUnreadMessagesState {
  unreadChatIds: Set<string>; // Set of chat IDs that have unread messages
  activeChatId: string | null; // The chat the user is currently viewing
  setUnreadChatIds: (chatIds: string[]) => void;
  addUnreadChat: (chatId: string) => void;
  removeUnreadChat: (chatId: string) => void;
  clearUnreadChats: () => void;
  setActiveChatId: (chatId: string | null) => void;
  getUnreadCount: () => number;
}

export const useUnreadMessagesStore = create<IUnreadMessagesState>((set, get) => ({
  unreadChatIds: new Set(),
  activeChatId: null,
  setUnreadChatIds: (chatIds: string[]) => set({ unreadChatIds: new Set(chatIds) }),
  addUnreadChat: (chatId: string) =>
    set((state) => {
      const newSet = new Set(state.unreadChatIds);
      newSet.add(chatId);
      return { unreadChatIds: newSet };
    }),
  removeUnreadChat: (chatId: string) =>
    set((state) => {
      const newSet = new Set(state.unreadChatIds);
      newSet.delete(chatId);
      return { unreadChatIds: newSet };
    }),
  clearUnreadChats: () => set({ unreadChatIds: new Set() }),
  setActiveChatId: (chatId: string | null) => set({ activeChatId: chatId }),
  getUnreadCount: () => get().unreadChatIds.size,
}));
