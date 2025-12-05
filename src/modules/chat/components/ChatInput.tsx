import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { IReplyContext } from '@/src/modules/chat/types';
import { Send, X } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
  style?: ViewStyle;
  replyingTo?: IReplyContext | null;
  onCancelReply?: () => void;
}

export default function ChatInput({
  value,
  onChangeText,
  onSend,
  placeholder = 'Start a new message',
  style,
  replyingTo,
  onCancelReply,
}: ChatInputProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleSend = () => {
    if (value.trim()) {
      onSend();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Reply preview banner */}
      {replyingTo && (
        <View style={styles.replyBanner}>
          <View style={styles.replyBannerContent}>
            <Text style={styles.replyBannerLabel}>Replying to {replyingTo.senderName}</Text>
            <Text style={styles.replyBannerText} numberOfLines={1}>
              {replyingTo.content}
            </Text>
          </View>
          <TouchableOpacity style={styles.replyBannerClose} onPress={onCancelReply}>
            <X color={theme.colors.text.secondary} size={20} />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.inputRow}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.text.secondary}
            value={value}
            onChangeText={onChangeText}
            multiline
            maxLength={1000}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendButton, !value.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!value.trim()}
        >
          <Send color={value.trim() ? theme.colors.text.inverse : theme.colors.text.secondary} size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background.primary,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    inputWrapper: {
      flex: 1,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.xl,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      maxHeight: 100,
    },
    input: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text.primary,
      padding: 0,
      minHeight: 20,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.accent.bookmark,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: theme.colors.background.secondary,
    },
    // Reply banner styles
    replyBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.background.secondary,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.accent.bookmark,
    },
    replyBannerContent: {
      flex: 1,
    },
    replyBannerLabel: {
      fontSize: theme.typography.sizes.xs,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.accent.bookmark,
      marginBottom: 2,
    },
    replyBannerText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
    },
    replyBannerClose: {
      padding: theme.spacing.xs,
    },
  });
