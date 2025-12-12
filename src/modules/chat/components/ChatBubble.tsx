import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { IChatMessageItem } from '@/src/modules/chat/types';
import { formatMessageTime } from '@/src/modules/chat/utils/formatters';
import { Image as ImageIcon, Mic } from 'lucide-react-native';
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ReactionPicker from './ReactionPicker';
import VoiceNotePlayer from './VoiceNotePlayer';

interface ChatBubbleProps {
  message: IChatMessageItem;
  isOwn: boolean;
  replyMessage?: IChatMessageItem | null;
  replyMessageSenderName?: string;
  onReply?: () => void;
  onReact?: (messageId: string, emoji: string) => void;
  onRemoveReact?: (messageId: string, emoji: string) => void;
  onOpenEmojiPicker?: () => void;
}

export default function ChatBubble({
  message,
  isOwn,
  replyMessage,
  replyMessageSenderName,
  onReply,
  onReact,
  onRemoveReact,
  onOpenEmojiPicker,
}: ChatBubbleProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const lastTapRef = useRef<number>(0);
  const bubbleRef = useRef<View>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [touchY, setTouchY] = useState(0);

  // Find current user's reaction (using reactedByMe from API)
  const userReaction = useMemo(() => {
    if (!message.reactions) return null;
    return message.reactions.find((r) => r.reactedByMe);
  }, [message.reactions]);

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

  const handleLongPress = (event: any) => {
    // Get absolute Y position of the touch
    const y = event.nativeEvent.pageY;
    setTouchY(y);
    setShowReactionPicker(true);
  };

  const handleReactionSelect = (emoji: string) => {
    // If user already has this reaction, remove it; otherwise add it
    if (userReaction?.emoji === emoji) {
      onRemoveReact?.(message.id, emoji);
    } else {
      onReact?.(message.id, emoji);
    }
  };

  const handleReactionBadgePress = (emoji: string, reactedByMe: boolean) => {
    // If it's the user's reaction, remove it; otherwise add this reaction
    if (reactedByMe) {
      onRemoveReact?.(message.id, emoji);
    } else {
      onReact?.(message.id, emoji);
    }
  };

  const hasImage = !!message.imageUrl;
  const hasText = !!message.content?.trim();
  const hasVoice = message.messageType === 'voice' && !!message.voiceNoteUrl;

  return (
    <View
      style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}
      testID={`chat_bubble_container_${message.id}`}
    >
      {replyMessage && (
        <View style={[styles.replyPreview, isOwn ? styles.ownReplyPreview : styles.otherReplyPreview]}>
          <Text style={[styles.replyName, isOwn ? styles.ownReplyName : styles.otherReplyName]} numberOfLines={1}>
            {replyMessageSenderName || 'Unknown'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {!!replyMessage.imageUrl && (
              <ImageIcon size={12} color={isOwn ? theme.colors.text.secondary : theme.colors.text.secondary} />
            )}
            {(replyMessage.messageType === 'voice' || !!replyMessage.voiceNoteUrl) && (
              <Mic size={12} color={isOwn ? theme.colors.text.secondary : theme.colors.text.secondary} />
            )}
            <Text
              style={[
                styles.replyText,
                isOwn ? styles.ownReplyText : styles.otherReplyText,
                hasImage && styles.imageCaption,
                {
                  paddingEnd:
                    replyMessage.imageUrl || replyMessage.messageType === 'voice' || replyMessage.voiceNoteUrl
                      ? theme.spacing.md
                      : 0,
                },
              ]}
              numberOfLines={2}
            >
              {(replyMessage.messageType === 'voice' || replyMessage.voiceNoteUrl) && !replyMessage.content
                ? t('messages.bubble.voiceMessage')
                : !!replyMessage.imageUrl && !replyMessage.content
                  ? t('messages.bubble.photo')
                  : replyMessage.content}
            </Text>
          </View>
        </View>
      )}
      <TouchableOpacity
        ref={bubbleRef}
        style={[
          styles.bubble,
          isOwn ? styles.ownBubble : styles.otherBubble,
          isOwn ? styles.ownBubbleTail : styles.otherBubbleTail,
          hasImage && styles.imageBubble,
          hasImage && hasText && styles.imageWithTextBubble,
          hasVoice && styles.voiceBubble,
        ]}
        onPress={handleDoubleTap}
        onLongPress={handleLongPress}
        delayLongPress={400}
        activeOpacity={0.8}
        testID={`chat_bubble_${message.id}`}
        accessibilityLabel={isOwn ? t('messages.bubble.yourMessage') : t('messages.bubble.receivedMessage')}
      >
        {hasVoice && (
          <VoiceNotePlayer
            voiceNoteUrl={message.voiceNoteUrl!}
            voiceNoteDuration={message.voiceNoteDuration}
            isOwn={isOwn}
          />
        )}
        {hasImage && (
          <Image
            source={{ uri: message.imageUrl! }}
            style={[styles.messageImage, hasText && { borderRadius: theme.borderRadius.lg }]}
            resizeMode="cover"
          />
        )}
        {hasText && (
          <Text style={[styles.text, isOwn ? styles.ownText : styles.otherText, hasImage && styles.imageCaption]}>
            {message.content}
          </Text>
        )}
      </TouchableOpacity>
      {message.reactions && message.reactions.length > 0 && (
        <View style={[styles.reactionsContainer, isOwn ? styles.ownReactions : styles.otherReactions]}>
          {message.reactions.map(({ emoji, count, reactedByMe }) => (
            <Pressable
              key={emoji}
              style={[styles.reactionBadge, reactedByMe && styles.userReactionBadge]}
              onPress={() => handleReactionBadgePress(emoji, reactedByMe)}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
              {count > 1 && <Text style={styles.reactionCount}>{count}</Text>}
            </Pressable>
          ))}
        </View>
      )}
      <Text style={styles.timestamp}>{formatMessageTime(message.createdAt)}</Text>

      {/* WhatsApp-style reaction picker modal */}
      <ReactionPicker
        visible={showReactionPicker}
        onClose={() => setShowReactionPicker(false)}
        onReactionSelect={handleReactionSelect}
        onMorePress={() => {
          setShowReactionPicker(false);
          setTimeout(() => onOpenEmojiPicker?.(), 300);
        }}
        selectedEmoji={userReaction?.emoji}
        isOwnMessage={isOwn}
        touchY={touchY}
      />
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
    ownBubbleTail: {
      borderBottomRightRadius: 4,
    },
    otherBubble: {
      backgroundColor: theme.colors.background.secondary,
    },
    otherBubbleTail: {
      borderBottomLeftRadius: 4,
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
    imageBubble: {
      padding: 0,
      paddingHorizontal: 0,
      paddingVertical: 0,
      overflow: 'hidden',
      width: 250,
    },
    imageWithTextBubble: {
      padding: 4,
      paddingHorizontal: 4,
      paddingVertical: 4,
    },
    messageImage: {
      width: '100%',
      height: 200,
      backgroundColor: theme.colors.background.tertiary, // Placeholder color
    },
    imageCaption: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.sm,
    },
    reactionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: theme.spacing.xxs,
      gap: theme.spacing.xxs,
    },
    ownReactions: {
      justifyContent: 'flex-end',
    },
    otherReactions: {
      justifyContent: 'flex-start',
    },
    reactionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.secondary,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    userReactionBadge: {
      backgroundColor: theme.colors.accent.bookmark + '20',
      borderColor: theme.colors.accent.bookmark,
    },
    reactionEmoji: {
      fontSize: 14,
    },
    reactionCount: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.text.secondary,
      marginLeft: 2,
    },
    voiceBubble: {
      minWidth: 200,
    },
  });
