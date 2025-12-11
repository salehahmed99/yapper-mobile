import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MessagesEmptyStateProps {
  onWriteMessage?: () => void;
}

export default function MessagesEmptyState({ onWriteMessage }: MessagesEmptyStateProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.emptyState} testID="messages_empty_state_container">
      <Text style={styles.emptyTitle} testID="messages_empty_state_title">
        Welcome to your inbox!
      </Text>
      <Text style={styles.emptySubtitle}>
        Drop a line, share posts and more with private conversations between you and others.
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={onWriteMessage}
        testID="messages_empty_state_button"
        accessibilityLabel="Write a message"
        accessibilityRole="button"
      >
        <Text style={styles.emptyButtonText}>Write a message</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    emptyState: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      paddingHorizontal: theme.spacing.xxl,
    },
    emptyTitle: {
      fontSize: theme.typography.sizes.xxl,
      fontFamily: theme.typography.fonts.extraBold,
      color: theme.colors.text.primary,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    emptySubtitle: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text.secondary,
      textAlign: 'left',
      lineHeight: theme.typography.sizes.md * theme.typography.lineHeights.relaxed,
      marginBottom: theme.spacing.xl,
    },
    emptyButton: {
      backgroundColor: theme.colors.accent.bookmark,
      paddingHorizontal: theme.spacing.xxll,
      paddingVertical: theme.spacing.lg,
      borderRadius: theme.borderRadius.full,
    },
    emptyButtonText: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
    },
  });
