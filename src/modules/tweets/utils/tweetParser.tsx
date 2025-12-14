/**
 * Parses text from react-native-controlled-mentions format
 * Input format: "{@}[username](userId)"
 * Returns: cleaned text with @username format
 *
 * Example:
 * Input: "Hello {@}[salehahmed99](4ab4cd28-f326-4ecd-981b-abcc99b83af1) how are you?"
 * Output: "Hello @salehahmed99 how are you?"
 */
export const parseMentionsFromText = (text: string): string => {
  // Regex to match {@}[username](userId) pattern
  const mentionRegex = /\{@\}\[([^\]]+)\]\([^)]+\)/g;

  // Replace each mention with @username format
  return text.replace(mentionRegex, (_, username) => `@${username}`);
};

/**
 * Calculates the actual character count excluding mention metadata
 * This is useful for displaying the correct character count to users
 */
export const getActualTextLength = (text: string): number => {
  const content = parseMentionsFromText(text);
  return content.length;
};

// Union type for the three possible segments
export type TweetSegment =
  | { type: 'text'; content: string }
  | { type: 'mention'; username: string }
  | { type: 'hashtag'; hashtag: string };

export const parseTweetBody = (content: string, mentions: string[] | undefined = []): TweetSegment[] => {
  /**
   * Regex Explanation:
   * 1. (\u200B\$\(\d+\)\u200C) -> Matches your backend mention format
   * 2. |                       -> OR
   * 3. (#[a-zA-Z0-9_]+)        -> Matches hashtags (alphanumeric + underscore)
   * * The outer parentheses ensure both matches are captured by .split()
   */
  const COMBINED_PATTERN = /(\u200B\$\(\d+\)\u200C|#[a-zA-Z0-9_]+)/g;

  const parts = content.split(COMBINED_PATTERN);

  return parts.map((part) => {
    // A. Handle Mentions (Your existing logic)
    if (part.startsWith('\u200B') && part.endsWith('\u200C')) {
      const match = part.match(/\d+/);
      const index = match ? parseInt(match[0], 10) : -1;
      const username = mentions[index];

      if (username) {
        return {
          type: 'mention',
          username: username,
        };
      }
    }

    // B. Handle Hashtags (New logic)
    if (part.startsWith('#')) {
      return { type: 'hashtag', hashtag: part };
    }

    // C. Default to plain text
    return { type: 'text', content: part };
  });
};
