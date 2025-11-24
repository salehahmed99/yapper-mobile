import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MessageItemProps {
  name: string;
  username: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  onPress?: () => void;
}

export default function MessageItem({ name, username, lastMessage, timestamp, unread, onPress }: MessageItemProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity style={styles.messageItem} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.charAt(0)}</Text>
      </View>
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.messageName}>{name}</Text>
          <Text style={styles.messageTime}>{timestamp}</Text>
        </View>
        <View style={styles.messageTextRow}>
          <Text style={styles.messageUsername}>@{username}</Text>
          <Text style={styles.messageDot}>·</Text>
          <Text style={[styles.messagePreview, unread && styles.messagePreviewUnread]} numberOfLines={1}>
            {lastMessage}
          </Text>
        </View>
      </View>
      {unread && <View style={styles.unreadDot} />}
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
      backgroundColor: theme.colors.accent.bookmark,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
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
      marginBottom: theme.spacing.xxs,
    },
    messageName: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
    },
    messageTime: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
    },
    messageTextRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    messageUsername: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
    },
    messageDot: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
    },
    messagePreview: {
      flex: 1,
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
    },
    messagePreviewUnread: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.medium,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.accent.bookmark,
      marginTop: theme.spacing.xs,
    },
  });
