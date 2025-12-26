import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { TweetSegment } from '../utils/tweetParser';

interface ITweetContentProps {
  segments: TweetSegment[];
  onMentionPress?: (username: string) => void;
  onHashtagPress?: (hashtag: string) => void;
}

/**
 * Reusable component for rendering tweet content with mentions and hashtags
 * Parses and styles mentions, hashtags, and plain text segments
 * All styling is handled internally using the theme
 */
const TweetContent: React.FC<ITweetContentProps> = ({ segments, onMentionPress, onHashtagPress }) => {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <Text style={styles.body}>
      {segments.map((segment, index) => {
        // 1. Render Mentions
        if (segment.type === 'mention') {
          return (
            <Text
              key={`mention-${index}-${segment.username}`}
              style={styles.mention}
              onPress={() => onMentionPress?.(segment.username)}
            >
              @{segment.username}
            </Text>
          );
        }

        // 2. Render Hashtags
        if (segment.type === 'hashtag') {
          return (
            <Text
              key={`hashtag-${index}-${segment.hashtag}`}
              style={styles.mention}
              onPress={() => onHashtagPress?.(segment.hashtag)}
            >
              {segment.hashtag}
            </Text>
          );
        }

        // 3. Render Plain Text
        return (
          <Text key={`text-${index}`} style={styles.text}>
            {segment.content}
          </Text>
        );
      })}
    </Text>
  );
};

export default TweetContent;

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    mention: {
      color: theme.colors.accent.bookmark,
    },
    text: {
      color: theme.colors.text.primary,
    },
    body: {
      fontFamily: theme.typography.fonts.regular,
      fontSize: theme.typography.sizes.sm,
    },
  });
};
