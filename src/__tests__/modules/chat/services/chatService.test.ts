import * as chatService from '@/src/modules/chat/services/chatService';
import api from '@/src/services/apiClient';

// Mock the API client
jest.mock('@/src/services/apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Mock secure storage if needed (not directly used here but good practice if deps change)
jest.mock('@/src/utils/secureStorage', () => ({
  getToken: jest.fn(),
  removeToken: jest.fn(),
  setToken: jest.fn(),
}));

describe('chatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getChats', () => {
    it('should fetch chats successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            data: [{ id: '1', name: 'Chat 1' }],
            pagination: { nextCursor: 'abc' },
          },
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await chatService.getChats();

      expect(api.get).toHaveBeenCalledWith('/chat');
      expect(result.chats).toEqual([{ id: '1', name: 'Chat 1' }]);
      expect(result.pagination).toEqual({ nextCursor: 'abc' });
    });

    it('should fetch chats with params', async () => {
      const mockResponse = { data: { data: { data: [], pagination: {} } } };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      await chatService.getChats({ limit: 10, cursor: 'xyz' });

      // Check URL encoding or params
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('limit=10'));
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('cursor=xyz'));
    });

    it('should handle errors', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

      await expect(chatService.getChats()).rejects.toThrow('Network Error');
    });
  });

  describe('getChatById', () => {
    it('should fetch chat by id', async () => {
      const mockResponse = { data: { data: { id: '123' } } };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await chatService.getChatById('123');

      expect(api.get).toHaveBeenCalledWith('/chat/123');
      expect(result).toEqual({ id: '123' });
    });
  });

  describe('getMessages', () => {
    it('should fetch messages with correct transformation', async () => {
      const mockMsg = {
        id: '1',
        content: 'Hi',
        sender_id: 'u1',
        reactions: [{ emoji: '👍', count: 1, reacted_by_me: true }],
      };
      const mockResponse = {
        data: {
          data: {
            data: {
              chatId: 'c1',
              sender: { id: 'u2' },
              messages: [mockMsg],
            },
            pagination: {},
          },
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await chatService.getMessages({ chatId: 'c1' });

      expect(api.get).toHaveBeenCalledWith('/messages/chats/c1/messages');
      expect(result.messages[0].senderId).toBe('u1');
      expect(result.messages?.[0]?.reactions?.[0]?.reactedByMe).toBe(true);
    });

    it('should handle getMessages error', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Fetch failed'));
      await expect(chatService.getMessages({ chatId: 'c1' })).rejects.toThrow('Fetch failed');
    });
  });

  describe('searchUsers', () => {
    it('should search users', async () => {
      const mockResponse = {
        data: { data: { data: [{ id: 'u1' }], pagination: {} } },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await chatService.searchUsers({ query: 'test' });

      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('query=test'));
      expect(result.users).toEqual([{ id: 'u1' }]);
    });
  });

  describe('createChat', () => {
    it('should create chat', async () => {
      const mockResponse = {
        data: { data: { id: 'c1' }, message: 'Created' },
      };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await chatService.createChat({ recipientId: 'u2' });

      expect(api.post).toHaveBeenCalledWith('/chat', { recipientId: 'u2' });
      expect(result.chat).toEqual({ id: 'c1' });
    });
  });

  describe('uploadMessageImage', () => {
    it('should upload image', async () => {
      const mockResponse = {
        data: { data: { imageUrl: 'http://img.com/1.jpg' } },
      };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await chatService.uploadMessageImage('file://path/to/img.jpg');

      expect(api.post).toHaveBeenCalledWith(
        '/messages/images/upload',
        expect.any(FormData),
        expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'multipart/form-data' }) }),
      );
      expect(result.imageUrl).toBe('http://img.com/1.jpg');
    });

    it('should handle upload failure', async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error('Upload failed'));
      await expect(chatService.uploadMessageImage('file://path')).rejects.toThrow('Upload failed');
    });
  });
});
