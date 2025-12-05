import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { IChatMessageItem } from '@/src/modules/chat/types';
import { formatMessageTime } from '@/src/modules/chat/utils/formatters';
import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ChatBubbleProps {
  message: IChatMessageItem;
  isOwn: boolean;
  replyMessage?: IChatMessageItem | null;
  replyMessageSenderName?: string;
  onReply?: () => void;
}

export default function ChatBubble({ message, isOwn, replyMessage, replyMessageSenderName, onReply }: ChatBubbleProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const lastTapRef = useRef<number>(0);

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      onReply?.();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  return (
    <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
      {/* Reply preview - shows above the bubble */}
      {replyMessage && (
        <View style={[styles.replyPreview, isOwn ? styles.ownReplyPreview : styles.otherReplyPreview]}>
          <Text style={[styles.replyName, isOwn ? styles.ownReplyName : styles.otherReplyName]} numberOfLines={1}>
            {replyMessageSenderName || 'Unknown'}
          </Text>
          <Text style={[styles.replyText, isOwn ? styles.ownReplyText : styles.otherReplyText]} numberOfLines={2}>
            {replyMessage.content}
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}
        onPress={handleDoubleTap}
        activeOpacity={0.8}
      >
        <Text style={[styles.text, isOwn ? styles.ownText : styles.otherText]}>{message.content}</Text>
      </TouchableOpacity>
      <Text style={styles.timestamp}>{formatMessageTime(message.createdAt)}</Text>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.lg,
    },
    ownContainer: {
      alignItems: 'flex-end',
    },
    otherContainer: {
      alignItems: 'flex-start',
    },
    bubble: {
      maxWidth: '75%',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.xl,
    },
    ownBubble: {
      backgroundColor: theme.colors.accent.bookmark,
    },
    otherBubble: {
      backgroundColor: theme.colors.background.secondary,
    },
    text: {
      fontSize: theme.typography.sizes.md,
      lineHeight: theme.typography.sizes.md * theme.typography.lineHeights.relaxed,
    },
    ownText: {
      color: theme.colors.text.inverse,
    },
    otherText: {
      color: theme.colors.text.primary,
    },
    timestamp: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xxs,
    },
    // Reply preview styles - positioned above bubble
    replyPreview: {
      maxWidth: '75%',
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      marginBottom: theme.spacing.xxs,
      borderRadius: theme.borderRadius.md,
      borderLeftWidth: 3,
    },
    ownReplyPreview: {
      backgroundColor: theme.colors.background.tertiary,
      borderLeftColor: theme.colors.accent.bookmark,
    },
    otherReplyPreview: {
      backgroundColor: theme.colors.background.tertiary,
      borderLeftColor: theme.colors.accent.bookmark,
    },
    replyName: {
      fontSize: theme.typography.sizes.xs,
      fontFamily: theme.typography.fonts.bold,
      marginBottom: 2,
    },
    ownReplyName: {
      color: theme.colors.accent.bookmark,
    },
    otherReplyName: {
      color: theme.colors.accent.bookmark,
    },
    replyText: {
      fontSize: theme.typography.sizes.xs,
    },
    ownReplyText: {
      color: theme.colors.text.secondary,
    },
    otherReplyText: {
      color: theme.colors.text.secondary,
    },
  });
