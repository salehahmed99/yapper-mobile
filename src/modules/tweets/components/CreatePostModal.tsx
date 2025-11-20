import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import BottomToolBar from '@/src/modules/tweets/components/BottomToolBar';
import CreatePostHeader from '@/src/modules/tweets/components/CreatePostHeader';
import ReplyRestrictionModal from '@/src/modules/tweets/components/ReplyRestrictionModal';
import ReplyRestrictionSelector from '@/src/modules/tweets/components/ReplyRestrictionSelector';
import { createTweet } from '@/src/modules/tweets/services/tweetService';
import { ITweet, ReplyRestrictionOptions } from '@/src/modules/tweets/types';
import { useAuthStore } from '@/src/store/useAuthStore';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import React, { useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

const MAX_TWEET_LENGTH = 280;

interface ICreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  type?: 'tweet' | 'quote' | 'reply';
  tweet?: ITweet | null;
}
const CreatePostModal: React.FC<ICreatePostModalProps> = (props) => {
  const { visible, onClose } = props;

  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { user } = useAuthStore();

  const [tweetText, setTweetText] = useState('');
  const [replyRestriction, setReplyRestriction] = useState<ReplyRestrictionOptions>('Everyone');
  const replyRestrictionModalRef = useRef<BottomSheetModal>(null);

  const textInputRef = useRef<TextInput>(null);

  const characterCount = tweetText.length;
  const remainingCharacters = MAX_TWEET_LENGTH - characterCount;
  const progressPercentage = (characterCount / MAX_TWEET_LENGTH) * 100;
  const canPost = characterCount > 0 && characterCount <= MAX_TWEET_LENGTH;

  const handlePost = async () => {
    if (canPost) {
      // TODO: Implement post creation
      await createTweet(tweetText);
      onClose();
    }
  };

  const handleOpenReplyModal = () => {
    Keyboard.dismiss();
    replyRestrictionModalRef.current?.present();
  };

  const handleSelectReplyRestriction = (option: ReplyRestrictionOptions) => {
    setReplyRestriction(option);
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 300);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <BottomSheetModalProvider>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <CreatePostHeader canPost={canPost} handleCancel={onClose} handlePost={handlePost} />
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={true}
          >
            {/* Profile Picture and Text Input */}
            <View style={styles.composeSection}>
              <Image
                source={{
                  uri: user?.avatarUrl || 'https://randomuser.me/api/portraits/men/1.jpg',
                }}
                style={styles.avatar}
              />
              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                placeholder="What's happening?"
                placeholderTextColor={theme.colors.text.secondary}
                multiline
                value={tweetText}
                onChangeText={setTweetText}
                autoFocus
                maxLength={MAX_TWEET_LENGTH + 100}
                cursorColor={theme.colors.accent.bookmark}
                selectionColor={theme.colors.accent.bookmark}
              />
            </View>
          </ScrollView>

          {/* Reply Restriction Selector */}
          <ReplyRestrictionSelector selectedOption={replyRestriction} onPress={handleOpenReplyModal} />

          {/* Bottom Toolbar */}
          <BottomToolBar remainingCharacters={remainingCharacters} progressPercentage={progressPercentage} />

          {/* Reply Restriction Modal */}
          <ReplyRestrictionModal
            bottomSheetRef={replyRestrictionModalRef}
            selectedOption={replyRestriction}
            onSelect={handleSelectReplyRestriction}
          />
        </KeyboardAvoidingView>
      </BottomSheetModalProvider>
    </Modal>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      flexGrow: 1,
      paddingBottom: theme.spacing.xxl,
    },
    composeSection: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    avatar: {
      width: theme.avatarSizes.sm,
      height: theme.avatarSizes.sm,
      borderRadius: theme.avatarSizes.sm / 2,
    },
    textInput: {
      flex: 1,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.regular,
      lineHeight: theme.typography.sizes.md * theme.typography.lineHeights.relaxed,
    },
  });

export default CreatePostModal;
