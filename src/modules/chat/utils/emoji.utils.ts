import emojiData from '@/assets/emojis.json';

export interface Emoji {
  emoji: string;
  name: string;
  keywords: string[];
}

export interface EmojiCategory {
  title: string;
  data: Emoji[];
}

const typedEmojiData = emojiData as EmojiCategory[];

// Pre-calculate flat list for faster search
const allEmojis = typedEmojiData.flatMap((category) => category.data);

export const getEmojiCategories = (): EmojiCategory[] => typedEmojiData;

export const searchEmojis = (query: string): Emoji[] => {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();

  // Use a simple filter. For 2-3k items this is instant.
  return allEmojis.filter(
    (emoji) => emoji.name.includes(lowerQuery) || emoji.keywords.some((k) => k.includes(lowerQuery)),
  );
};
