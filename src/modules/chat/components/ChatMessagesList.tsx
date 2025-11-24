import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import useSpacing from '@/src/hooks/useSpacing';
import ChatBubble from '@/src/modules/chat/components/ChatBubble';
import { ChatMessage } from '@/src/modules/chat/types';
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';

interface ChatMessagesListProps {
  messages: ChatMessage[];
}

export default function ChatMessagesList({ messages }: ChatMessagesListProps) {
  const { theme } = useTheme();
  const { bottom } = useSpacing();
  const styles = createStyles(theme);
  const flatListRef = React.useRef<FlatList>(null);

  React.useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const renderMessage = ({ item }: { item: ChatMessage }) => <ChatBubble message={item} />;

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[styles.listContent, { paddingBottom: bottom }]}
      inverted={false}
    />
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    listContent: {
      paddingTop: theme.spacing.md,
    },
  });
