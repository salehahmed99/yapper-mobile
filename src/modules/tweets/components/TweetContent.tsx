import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { Text } from 'react-native';
import { TweetSegment } from '../utils/tweetParser';

interface ITweetContentProps {
  segments: TweetSegment[];
  onMentionPress?: (userId: string) => void;
  onHashtagPress?: (hashtag: string) => void;
}

/**
 * Reusable component for rendering tweet content with mentions and hashtags
 * Parses and styles mentions, hashtags, and plain text segments
 * All styling is handled internally using the theme
 */
const TweetContent: React.FC<ITweetContentProps> = ({ segments, onMentionPress, onHashtagPress }) => {
  const { theme } = useTheme();

  // Internal styles using theme
  const mentionStyle = {
    color: theme.colors.accent.bookmark,
  };

  return (
    <>
      {segments.map((segment, index) => {
        // 1. Render Mentions
        if (segment.type === 'mention') {
          return (
            <Text key={`mention-${index}`} style={mentionStyle} onPress={() => onMentionPress?.(segment.mention.id)}>
              @{segment.mention.username}
            </Text>
          );
        }

        // 2. Render Hashtags
        if (segment.type === 'hashtag') {
          return (
            <Text key={`hashtag-${index}`} style={mentionStyle} onPress={() => onHashtagPress?.(segment.hashtag)}>
              {segment.hashtag}
            </Text>
          );
        }

        // 3. Render Plain Text
        return <Text key={`text-${index}`}>{segment.content}</Text>;
      })}
    </>
  );
};

export default TweetContent;
