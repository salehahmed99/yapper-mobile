import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { formatRelativeTime } from '@/src/modules/chat/utils/formatters';
import { Image as ImageIcon, Mic } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IChat } from '../types';

interface MessageItemProps {
  chat: IChat;
  onPress?: () => void;
}

export default function MessageItem({ chat, onPress }: MessageItemProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { participant, lastMessage, unreadCount } = chat;
  const hasUnread = unreadCount > 0;
  const timestamp = lastMessage?.createdAt;

  if (!participant) {
    return null;
  }

  const displayName = participant.name || participant.username || 'Unknown';
  const avatarLetter = participant.name?.charAt(0) || participant.username?.charAt(0) || '?';

  const renderPreview = () => {
    if (!lastMessage) return <Text style={styles.noMessages}>No messages yet</Text>;

    const hasImage = !!lastMessage.imageUrl;
    const hasVoice = lastMessage.messageType === 'voice' || !!lastMessage.voiceNoteUrl;
    const content = lastMessage.content || (hasVoice ? 'Voice message' : hasImage ? 'Photo' : '');

    return (
      <View style={styles.previewContainer}>
        {hasImage && (
          <ImageIcon
            size={16}
            color={hasUnread ? theme.colors.text.primary : theme.colors.text.secondary}
            style={styles.previewIcon}
          />
        )}
        {hasVoice && (
          <Mic
            size={16}
            color={hasUnread ? theme.colors.text.primary : theme.colors.text.secondary}
            style={styles.previewIcon}
          />
        )}
        <Text
          style={[
            styles.messagePreview,
            hasUnread && styles.messagePreviewUnread,
            (hasImage || hasVoice) && styles.imageTextContainer,
          ]}
          numberOfLines={1}
        >
          {content}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.messageItem}
      onPress={onPress}
      testID={`message_item_${chat.id}`}
      accessibilityLabel={`Chat with ${displayName}`}
    >
      {participant.avatarUrl ? (
        <Image source={{ uri: participant.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarText}>{avatarLetter}</Text>
        </View>
      )}
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <View style={styles.nameRow}>
            <Text style={styles.messageName} numberOfLines={1} testID={`message_item_name_${chat.id}`}>
              {displayName}
            </Text>
            <Text style={styles.messageUsername} numberOfLines={1}>
              @{participant.username || 'unknown'}
            </Text>
            {timestamp && (
              <>
                <Text style={styles.dotSeparator}>·</Text>
                <Text style={styles.messageTime}>{formatRelativeTime(timestamp)}</Text>
              </>
            )}
          </View>
          {hasUnread && <View style={styles.unreadDot} />}
        </View>
        {renderPreview()}
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    messageItem: {
      flexDirection: 'row',
      padding: theme.spacing.lg,
      alignItems: 'flex-start',
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: theme.spacing.md,
    },
    avatarPlaceholder: {
      backgroundColor: theme.colors.accent.bookmark,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: theme.typography.sizes.lg,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.background.primary,
    },
    messageContent: {
      flex: 1,
    },
    messageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: theme.spacing.xs,
      overflow: 'hidden',
    },
    messageName: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
      flexShrink: 1,
    },
    messageUsername: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
      flexShrink: 2,
    },
    dotSeparator: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
      flexShrink: 0,
    },
    messageTime: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
      flexShrink: 0,
    },
    messagePreview: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
    },
    messagePreviewUnread: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.medium,
    },
    noMessages: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
      fontStyle: 'italic',
    },
    unreadDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.accent.bookmark,
      marginLeft: theme.spacing.xs,
    },
    previewContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    previewIcon: {
      marginRight: theme.spacing.xs,
    },
    imageTextContainer: {
      paddingEnd: theme.spacing.md,
    },
  });
