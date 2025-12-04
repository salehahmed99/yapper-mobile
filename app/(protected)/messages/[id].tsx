import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import ChatHeader from '@/src/modules/chat/components/ChatHeader';
import ChatInput from '@/src/modules/chat/components/ChatInput';
import ChatMessagesList from '@/src/modules/chat/components/ChatMessagesList';
import { getConversationById } from '@/src/modules/chat/mocks/conversations';
import { ChatMessage } from '@/src/modules/chat/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    text: 'Hey! How are you doing?',
    timestamp: '10:30 AM',
    isOwn: false,
  },
  {
    id: '2',
    text: "I'm doing great, thanks for asking! How about you?",
    timestamp: '10:32 AM',
    isOwn: true,
  },
  {
    id: '3',
    text: 'Pretty good! Working on some exciting projects.',
    timestamp: '10:33 AM',
    isOwn: false,
  },
  {
    id: '4',
    text: "That sounds awesome! I'd love to hear more about them.",
    timestamp: '10:35 AM',
    isOwn: true,
  },
  {
    id: '5',
    text: "Sure! I'll send you some details later today.",
    timestamp: '10:36 AM',
    isOwn: false,
  },
];

export default function ChatConversationPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const [messages, setMessages] = React.useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = React.useState('');

  const conversation = getConversationById(id as string);
  const userName = conversation?.name || 'Unknown User';
  const username = conversation?.username || 'unknown';

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text: inputText.trim(),
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        isOwn: true,
        status: 'sent',
      };
      setMessages([...messages, newMessage]);
      setInputText('');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <ChatHeader name={userName} username={username} onBack={handleBack} onInfo={() => {}} />
      </View>
      <View style={styles.messagesContainer}>
        <ChatMessagesList messages={messages} />
      </View>
      <ChatInput value={inputText} onChangeText={setInputText} onSend={handleSend} />
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    header: {
      backgroundColor: theme.colors.background.primary,
    },
    messagesContainer: {
      flex: 1,
    },
  });
