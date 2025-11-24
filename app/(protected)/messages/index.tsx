import FloatingActionButton from '@/src/components/FloatingActionButton';
import AppBar from '@/src/components/shell/AppBar';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import useSpacing from '@/src/hooks/useSpacing';
import MessagesList from '@/src/modules/chat/components/MessagesList';
import SearchBar from '@/src/modules/chat/components/SearchBar';
import { MOCK_CONVERSATIONS } from '@/src/modules/chat/mocks/conversations';
import { Message } from '@/src/modules/chat/types';
import { useRouter } from 'expo-router';
import { MailPlus, SettingsIcon } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MessagesPage() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { bottom } = useSpacing();
  const styles = createStyles(theme);
  const [searchQuery, setSearchQuery] = React.useState('');
  const top = insets.top + theme.ui.appBarHeight;

  const handleMessagePress = (message: Message) => {
    router.push(`/messages/${message.id}`);
  };

  const handleWriteMessage = () => {
    // TODO: Open new message composer modal
    console.log('Write new message');
  };

  return (
    <View style={styles.container}>
      <View style={styles.appBarWrapper}>
        <AppBar rightElement={<SettingsIcon color={theme.colors.text.primary} />}>
          <Text style={styles.title}>Messages</Text>
        </AppBar>
      </View>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search Direct Messages"
        style={{ marginTop: top }}
      />
      <MessagesList
        messages={MOCK_CONVERSATIONS}
        onMessagePress={handleMessagePress}
        onWriteMessage={handleWriteMessage}
      />
      <FloatingActionButton
        onPress={handleWriteMessage}
        icon={<MailPlus color={theme.colors.text.primary} size={24} strokeWidth={2.5} />}
        style={{ bottom: bottom + theme.spacing.lg, right: theme.spacing.lg }}
      />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    appBarWrapper: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
    },
    title: {
      fontSize: theme.typography.sizes.xl,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
    },
  });
