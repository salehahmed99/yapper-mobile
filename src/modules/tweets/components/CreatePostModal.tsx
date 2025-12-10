import { DEFAULT_AVATAR_URL } from '@/src/constants/defaults';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import BottomToolBar from '@/src/modules/tweets/components/BottomToolBar';
import CreatePostHeader from '@/src/modules/tweets/components/CreatePostHeader';
import ReplyRestrictionModal from '@/src/modules/tweets/components/ReplyRestrictionModal';
import ReplyRestrictionSelector from '@/src/modules/tweets/components/ReplyRestrictionSelector';
import TweetMediaPicker from '@/src/modules/tweets/components/TweetMediaPicker';
import { ITweet } from '@/src/modules/tweets/types';
import { MediaAsset, pickMediaFromLibrary, showCameraOptions } from '@/src/modules/tweets/utils/tweetMediaPicker.utils';
import { useAuthStore } from '@/src/store/useAuthStore';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { TriggersConfig, useMentions } from 'react-native-controlled-mentions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import UserSuggestionsListContainer from '../containers/UserSuggestionsListContainer';
import ParentTweet from './ParentTweet';
import ParentTweetV2 from './ParentTweetV2';

const MAX_TWEET_LENGTH = 280;

interface ICreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'tweet' | 'quote' | 'reply';
  tweet?: ITweet;
  onPost?: (content: string, mediaUris?: string[]) => void;
  onPostReply?: (tweetId: string, content: string, mediaUris?: string[]) => void;
  onPostQuote?: (tweetId: string, content: string, mediaUris?: string[]) => void;
}

const CreatePostModal: React.FC<ICreatePostModalProps> = (props) => {
  const { visible, onClose, type, tweet, onPost, onPostReply, onPostQuote } = props;

  const { theme } = useTheme();
  const { t } = useTranslation();

  const styles = createStyles(theme);
  const { user } = useAuthStore();

  const [tweetText, setTweetText] = useState('');
  const [replyRestriction, setReplyRestriction] = useState<number>(0);
  const triggersConfig: TriggersConfig<'mention'> = useMemo(() => {
    return {
      mention: {
        // Symbol that will trigger keyword change
        trigger: '@',

        // Style which mention will be highlighted in the `TextInput`
        textStyle: { color: theme.colors.accent.bookmark },
      },
    };
  }, [theme]);

  const { textInputProps, triggers } = useMentions({
    value: tweetText,
    onChange: setTweetText,
    triggersConfig,
  });
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const replyRestrictionModalRef = useRef<BottomSheetModal>(null);

  const textInputRef = useRef<TextInput>(null);

  // Clear all form state when modal closes
  useEffect(() => {
    if (!visible) {
      setTweetText('');
      setMedia([]);
      setReplyRestriction(0);
    }
  }, [visible]);

  const characterCount = tweetText.length;
  const remainingCharacters = MAX_TWEET_LENGTH - characterCount;
  const progressPercentage = (characterCount / MAX_TWEET_LENGTH) * 100;
  const canPost = characterCount > 0 && characterCount <= MAX_TWEET_LENGTH;
  const insets = useSafeAreaInsets();

  const resetTweetState = () => {
    setTweetText('');
    setMedia([]);
    setReplyRestriction(0);
  };

  const handlePost = async () => {
    const mediaUris = media.map((m) => m.uri);
    if (type === 'tweet' && onPost) {
      onPost(tweetText, mediaUris);
    } else if (type === 'quote' && onPostQuote) {
      onPostQuote(tweet!.tweetId, tweetText, mediaUris);
    } else if (type === 'reply' && onPostReply) {
      onPostReply(tweet!.tweetId, tweetText, mediaUris);
    }
    resetTweetState();
    onClose();
  };

  const handleOpenGallery = async () => {
    Keyboard.dismiss();
    const selectedMedia = await pickMediaFromLibrary(4 - media.length);
    if (selectedMedia.length > 0) {
      setMedia((prev) => [...prev, ...selectedMedia].slice(0, 4));
    }
  };

  const handleOpenCamera = () => {
    Keyboard.dismiss();
    showCameraOptions((selectedMedia) => {
      if (selectedMedia) {
        setMedia((prev) => [...prev, selectedMedia].slice(0, 4));
      }
    });
  };

  const handleRemoveMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOpenReplyModal = () => {
    Keyboard.dismiss();
    replyRestrictionModalRef.current?.present();
  };

  const handleSelectReplyRestriction = (option: number) => {
    setReplyRestriction(option);
    textInputRef.current?.focus();
  };

  const handleClosePostModal = () => {
    resetTweetState();
    onClose();
  };

  const getPlaceholderText = () => {
    switch (type) {
      case 'tweet':
        return t('tweets.createPost.placeholders.whatsHappening');
      case 'quote':
        return t('tweets.createPost.placeholders.addComment');
      case 'reply':
        return t('tweets.createPost.placeholders.postYourReply');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="overFullScreen">
      <BottomSheetModalProvider>
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <CreatePostHeader canPost={canPost} handleCancel={handleClosePostModal} handlePost={handlePost} />
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1, gap: theme.spacing.xxl }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              {tweet && type === 'reply' && <ParentTweetV2 tweet={tweet} />}
              {/* Profile Picture and Text Input */}
              <View style={styles.composeSection}>
                <Image
                  source={{
                    uri: user?.avatarUrl || DEFAULT_AVATAR_URL,
                  }}
                  style={styles.avatar}
                />
                <View style={styles.postContentContainer}>
                  <TextInput
                    {...textInputProps}
                    ref={textInputRef}
                    style={styles.textInput}
                    placeholder={getPlaceholderText()}
                    placeholderTextColor={theme.colors.text.secondary}
                    multiline
                    autoFocus
                    maxLength={MAX_TWEET_LENGTH + 100}
                    cursorColor={theme.colors.accent.bookmark}
                    selectionColor={theme.colors.accent.bookmark}
                    testID="create_post_text_input"
                    accessibilityLabel="create_post_text_input"
                  />
                  {tweet && type === 'quote' && <ParentTweet tweet={tweet} />}
                  {/* Media Picker */}
                  {media.length > 0 && <TweetMediaPicker media={media} onRemoveMedia={handleRemoveMedia} />}
                </View>
              </View>
              <UserSuggestionsListContainer {...triggers.mention} onCloseModal={onClose} />
            </ScrollView>

            <ReplyRestrictionSelector selectedOption={replyRestriction} onPress={handleOpenReplyModal} />

            <BottomToolBar
              remainingCharacters={remainingCharacters}
              progressPercentage={progressPercentage}
              onGalleryPress={handleOpenGallery}
              onCameraPress={handleOpenCamera}
              mediaCount={media.length}
            />

            <ReplyRestrictionModal
              bottomSheetRef={replyRestrictionModalRef}
              selectedOption={replyRestriction}
              onSelect={handleSelectReplyRestriction}
            />
          </KeyboardAvoidingView>
        </View>
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
    composeSection: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
      marginTop: theme.spacing.sm,
      //   borderWidth: 1,
      //   borderColor: 'red',
    },
    avatar: {
      width: theme.avatarSizes.sm,
      height: theme.avatarSizes.sm,
      borderRadius: theme.avatarSizes.sm / 2,
    },

    postContentContainer: {
      flex: 1,
      gap: theme.spacing.sm,
    },
    textInput: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.regular,
      lineHeight: theme.typography.sizes.md * theme.typography.lineHeights.relaxed,
    },
  });

export default CreatePostModal;
