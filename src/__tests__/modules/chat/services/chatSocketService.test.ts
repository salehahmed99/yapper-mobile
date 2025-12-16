import { ChatSocketEvents, chatSocketService } from '@/src/modules/chat/services/chatSocketService';
import { socketService } from '@/src/services/socketService';

// Mock the base socket service
jest.mock('@/src/services/socketService', () => ({
  socketService: {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  },
}));

describe('chatSocketService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Emit Methods', () => {
    it('joinChat should emit JOIN_CHAT', () => {
      chatSocketService.joinChat('chat1');
      expect(socketService.emit).toHaveBeenCalledWith(ChatSocketEvents.JOIN_CHAT, { chat_id: 'chat1' });
    });

    it('sendMessage should emit SEND_MESSAGE', () => {
      chatSocketService.sendMessage('chat1', 'hello', 'text');
      expect(socketService.emit).toHaveBeenCalledWith(ChatSocketEvents.SEND_MESSAGE, {
        chat_id: 'chat1',
        message: expect.objectContaining({ content: 'hello', message_type: 'text' }),
      });
    });

    it('startTyping should emit TYPING_START', () => {
      chatSocketService.startTyping('chat1');
      expect(socketService.emit).toHaveBeenCalledWith(ChatSocketEvents.TYPING_START, { chat_id: 'chat1' });
    });

    // ... add other specific emit tests as needed, pattern is identical
  });

  describe('Listener Methods', () => {
    it('onNewMessage should register callback for NEW_MESSAGE', () => {
      const callback = jest.fn();
      chatSocketService.onNewMessage(callback);
      expect(socketService.on).toHaveBeenCalledWith(ChatSocketEvents.NEW_MESSAGE, callback);
    });

    it('offNewMessage should remove callback for NEW_MESSAGE', () => {
      const callback = jest.fn();
      chatSocketService.offNewMessage(callback);
      expect(socketService.off).toHaveBeenCalledWith(ChatSocketEvents.NEW_MESSAGE, callback);
    });

    // ... add other listener tests, pattern is identical
  });
});
