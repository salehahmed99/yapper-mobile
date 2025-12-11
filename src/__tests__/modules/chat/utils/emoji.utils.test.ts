import { getEmojiCategories, searchEmojis } from '@/src/modules/chat/utils/emoji.utils';

// Mock the emojis JSON data since it's imported
jest.mock('@/assets/emojis.json', () => [
  {
    title: 'Smileys & Emotion',
    data: [
      { emoji: '😀', name: 'grinning face', keywords: ['face', 'smile', 'happy'] },
      { emoji: '😢', name: 'crying face', keywords: ['face', 'sad', 'tear'] },
    ],
  },
  {
    title: 'Animals & Nature',
    data: [{ emoji: '🐶', name: 'dog face', keywords: ['animal', 'pet', 'puppy'] }],
  },
]);

describe('emoji.utils', () => {
  describe('getEmojiCategories', () => {
    it('should return the mocked emoji categories', () => {
      const categories = getEmojiCategories();
      expect(categories).toHaveLength(2);
      expect(categories[0].title).toBe('Smileys & Emotion');
      expect(categories[1].title).toBe('Animals & Nature');
    });
  });

  describe('searchEmojis', () => {
    it('should return empty array for empty or whitespace query', () => {
      expect(searchEmojis('')).toEqual([]);
      expect(searchEmojis('   ')).toEqual([]);
    });

    it('should return emojis matching name', () => {
      const results = searchEmojis('grinning');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('grinning face');
    });

    it('should return emojis matching keywords', () => {
      const results = searchEmojis('happy');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('grinning face');
    });

    it('should return emojis matching case-insensitive', () => {
      const results = searchEmojis('DOG');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('dog face');
    });

    it('should return multiple matches', () => {
      const results = searchEmojis('face');
      expect(results).toHaveLength(3); // grinning face, crying face, dog face
    });

    it('should return empty array when no match found', () => {
      const results = searchEmojis('rocket');
      expect(results).toEqual([]);
    });

    it('should handle special characters gracefully', () => {
      const results = searchEmojis('@#$%');
      expect(results).toEqual([]);
    });

    it('should match partial keywords', () => {
      // 'puppy' is a keyword for dog
      const results = searchEmojis('pup');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('dog face');
    });
  });
});
