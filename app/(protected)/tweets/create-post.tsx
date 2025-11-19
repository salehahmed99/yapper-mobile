import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import BottomToolBar from '@/src/modules/tweets/components/BottomToolBar';
import CreatePostHeader from '@/src/modules/tweets/components/CreatePostHeader';
import ReplyRestrictionModal from '@/src/modules/tweets/components/ReplyRestrictionModal';
import ReplyRestrictionSelector from '@/src/modules/tweets/components/ReplyRestrictionSelector';
import { createTweet } from '@/src/modules/tweets/services/tweetService';
import { ReplyRestrictionOptions } from '@/src/modules/tweets/types';
import { useAuthStore } from '@/src/store/useAuthStore';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

const MAX_TWEET_LENGTH = 280;

const CreatePostScreen = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const { user } = useAuthStore();

  const [tweetText, setTweetText] = useState('');
  const [replyRestriction, setReplyRestriction] = useState<ReplyRestrictionOptions>('Everyone');
  const replyRestrictionModalRef = useRef<BottomSheetModal>(null);

  const textInputRef = useRef<TextInput>(null);

  const characterCount = tweetText.length;
  const remainingCharacters = MAX_TWEET_LENGTH - characterCount;
  const progressPercentage = (characterCount / MAX_TWEET_LENGTH) * 100;
  const canPost = characterCount > 0 && characterCount <= MAX_TWEET_LENGTH;

  const handleCancel = () => {
    router.back();
  };

  const handlePost = async () => {
    if (canPost) {
      // TODO: Implement post creation
      await createTweet(tweetText);
      router.back();
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <CreatePostHeader canPost={canPost} handleCancel={handleCancel} handlePost={handlePost} />
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

export default CreatePostScreen;
