import { getActualTextLength, parseMentionsFromText, parseTweetBody } from '../tweetParser';

describe('tweetParser', () => {
  describe('parseMentionsFromText', () => {
    it('should replace mentions with @username format', () => {
      const input = 'Hello {@}[salehahmed99](123) how are you?';
      const expected = 'Hello @salehahmed99 how are you?';
      expect(parseMentionsFromText(input)).toBe(expected);
    });

    it('should replace multiple mentions', () => {
      const input = '{@}[user1](1) and {@}[user2](2)';
      const expected = '@user1 and @user2';
      expect(parseMentionsFromText(input)).toBe(expected);
    });

    it('should return text as is if no mentions', () => {
      const input = 'Hello world';
      expect(parseMentionsFromText(input)).toBe(input);
    });
  });

  describe('getActualTextLength', () => {
    it('should return correct length excluding metadata', () => {
      const input = 'Hello {@}[user](1)';
      // "Hello @user" -> 11 chars
      expect(getActualTextLength(input)).toBe(11);
    });

    it('should return correct length for plain text', () => {
      expect(getActualTextLength('Hello')).toBe(5);
    });
  });

  describe('parseTweetBody', () => {
    it('should parse plain text', () => {
      const content = 'Just some text';
      const result = parseTweetBody(content);
      expect(result).toEqual([{ type: 'text', content: 'Just some text' }]);
    });

    it('should parse backend mention format', () => {
      const content = 'Hello \u200B$(0)\u200C';
      const mentions = ['user1'];
      const result = parseTweetBody(content, mentions);
      const filtered = result.filter((p) => p.type !== 'text' || p.content !== '');

      expect(filtered).toEqual([
        { type: 'text', content: 'Hello ' },
        { type: 'mention', username: 'user1' },
      ]);
    });

    // The current implementation of split might produce empty strings, let's check exact behavior
    // or just expect what the function returns.
    // Based on the code: content.split(PATTERN)
    // If "Hello \u200B$(0)\u200C", split will likely give ["Hello ", "\u200B$(0)\u200C", ""]

    it('should identify hashtags', () => {
      const content = 'Loving #ReactNative today';
      const result = parseTweetBody(content);
      const filtered = result.filter((p) => p.type !== 'text' || p.content !== '');

      // Expected split: ["Loving ", "#ReactNative", " today"]
      expect(filtered).toEqual([
        { type: 'text', content: 'Loving ' },
        { type: 'hashtag', hashtag: '#ReactNative' },
        { type: 'text', content: ' today' },
      ]);
    });

    it('should handle mixed content (Text, Mention, Hashtag)', () => {
      const content = 'Hey \u200B$(0)\u200C check out #TypeScript';
      const mentions = ['dev_user'];
      const result = parseTweetBody(content, mentions);
      const filtered = result.filter((p) => p.type !== 'text' || p.content !== '');

      expect(filtered).toEqual([
        { type: 'text', content: 'Hey ' },
        { type: 'mention', username: 'dev_user' },
        { type: 'text', content: ' check out ' },
        { type: 'hashtag', hashtag: '#TypeScript' },
      ]);
    });

    it('should handle missing mention in array gracefully', () => {
      const content = 'Hey \u200B$(99)\u200C';
      const mentions: string[] = []; // No mentions
      const result = parseTweetBody(content, mentions);

      // Should default to undefined username -> pure text?
      // Looking at code: if (username) { return mention } else { ... return text }
      // But the splitting logic captures the backend format.
      // If it falls through, it returns { type: 'text', content: part }

      expect(result).toContainEqual({ type: 'text', content: '\u200B$(99)\u200C' });
    });
    it('should fall back to text for malformed mention placeholders', () => {
      // This string looks like a mention (starts/ends with hidden chars) but doesn't have valid ID structure
      // or valid index.
      // Note: The split regex expects $(digits), so this won't be split out.
      // It will enter the map as a single chunk.
      // It passes startsWith/endsWith checks but fails index lookup.
      const content = '\u200Bmalformed_placeholder\u200C';
      const mentions = ['user1'];
      const result = parseTweetBody(content, mentions);

      expect(result).toEqual([{ type: 'text', content: content }]);
    });
  });
});
