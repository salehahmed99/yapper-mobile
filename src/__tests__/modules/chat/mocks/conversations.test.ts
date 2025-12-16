import { getConversationById, MOCK_CONVERSATIONS } from '@/src/modules/chat/mocks/conversations';

describe('conversations mocks', () => {
  it('should return conversation by id', () => {
    const conv = getConversationById('1');
    expect(conv).toBeDefined();
    expect(conv?.id).toBe('1');
  });

  it('should have mock data', () => {
    expect(MOCK_CONVERSATIONS.length).toBeGreaterThan(0);
  });
});
