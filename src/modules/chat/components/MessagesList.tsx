import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import useSpacing from '@/src/hooks/useSpacing';
import MessageItem from '@/src/modules/chat/components/MessageItem';
import MessagesEmptyState from '@/src/modules/chat/components/MessagesEmptyState';
import { Message } from '@/src/modules/chat/types';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

interface MessagesListProps {
  messages: Message[];
  onMessagePress?: (message: Message) => void;
  onWriteMessage?: () => void;
}

export default function MessagesList({ messages, onMessagePress, onWriteMessage }: MessagesListProps) {
  const { theme } = useTheme();
  const { bottom } = useSpacing();
  const styles = createStyles(theme);

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageItem
      name={item.name}
      username={item.username}
      lastMessage={item.lastMessage}
      timestamp={item.timestamp}
      unread={item.unread}
      onPress={() => onMessagePress?.(item)}
    />
  );

  const renderEmptyState = () => <MessagesEmptyState onWriteMessage={onWriteMessage} />;

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <FlatList
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.listContent,
        { paddingBottom: bottom },
        messages.length === 0 && styles.listContentEmpty,
      ]}
      ItemSeparatorComponent={renderSeparator}
      ListEmptyComponent={renderEmptyState}
    />
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    listContent: {
      flexGrow: 1,
    },
    listContentEmpty: {
      justifyContent: 'center',
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginLeft: 48 + theme.spacing.md + theme.spacing.lg,
    },
  });
