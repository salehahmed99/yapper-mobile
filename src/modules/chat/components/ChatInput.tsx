import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { Send } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
}

export default function ChatInput({
  value,
  onChangeText,
  onSend,
  placeholder = 'Start a new message',
}: ChatInputProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleSend = () => {
    if (value.trim()) {
      onSend();
    }
  };

  return (
    <View style={styles.container}>
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
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background.primary,
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
  });
