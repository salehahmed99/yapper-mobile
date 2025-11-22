import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import BottomToolBar from '@/src/modules/tweets/components/BottomToolBar';
import CreatePostHeader from '@/src/modules/tweets/components/CreatePostHeader';
import ReplyRestrictionModal from '@/src/modules/tweets/components/ReplyRestrictionModal';
import ReplyRestrictionSelector from '@/src/modules/tweets/components/ReplyRestrictionSelector';
import TweetMediaPicker from '@/src/modules/tweets/components/TweetMediaPicker';
import { ITweet, ReplyRestrictionOptions } from '@/src/modules/tweets/types';
import { MediaAsset, pickMediaFromLibrary, showCameraOptions } from '@/src/modules/tweets/utils/tweetMediaPicker.utils';
import { useAuthStore } from '@/src/store/useAuthStore';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import React, { useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import ParentTweet from './ParentTweet';
import ParentTweetV2 from './ParentTweetV2';

const MAX_TWEET_LENGTH = 280;

interface ICreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'tweet' | 'quote' | 'reply';
  tweet?: ITweet | null;
  onPost: (content: string, mediaUris?: string[]) => void;
  onRepost?: () => void;
}
const CreatePostModal: React.FC<ICreatePostModalProps> = (props) => {
  const { visible, onClose, type, tweet, onPost, onRepost } = props;

  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { user } = useAuthStore();

  const [tweetText, setTweetText] = useState('');
  const [replyRestriction, setReplyRestriction] = useState<ReplyRestrictionOptions>('Everyone');
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const replyRestrictionModalRef = useRef<BottomSheetModal>(null);

  const textInputRef = useRef<TextInput>(null);

  const characterCount = tweetText.length;
  const remainingCharacters = MAX_TWEET_LENGTH - characterCount;
  const progressPercentage = (characterCount / MAX_TWEET_LENGTH) * 100;
  const canPost = (characterCount > 0 || type === 'quote') && characterCount <= MAX_TWEET_LENGTH;

  const handlePost = async () => {
    if (type === 'quote' && characterCount === 0 && onRepost) {
      onRepost();
      onClose();
      return;
    }
    const mediaUris = media.map((m) => m.uri);
    onPost(tweetText, mediaUris);
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

  const handleSelectReplyRestriction = (option: ReplyRestrictionOptions) => {
    setReplyRestriction(option);
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 300);
  };

  const getPlaceholderText = () => {
    switch (type) {
      case 'tweet':
        return "What's happening?";
      case 'quote':
        return 'Add a comment';
      case 'reply':
        return 'Post your reply';
    }
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
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            {tweet && type === 'reply' && <ParentTweetV2 tweet={tweet} />}
            {/* Profile Picture and Text Input */}
            <View style={styles.composeSection}>
              <Image
                source={{
                  uri: user?.avatarUrl || 'https://randomuser.me/api/portraits/men/1.jpg',
                }}
                style={styles.avatar}
              />
              <View style={styles.postContentContainer}>
                {
                  <TextInput
                    ref={textInputRef}
                    style={styles.textInput}
                    placeholder={getPlaceholderText()}
                    placeholderTextColor={theme.colors.text.secondary}
                    multiline
                    value={tweetText}
                    onChangeText={setTweetText}
                    autoFocus
                    maxLength={MAX_TWEET_LENGTH + 100}
                    cursorColor={theme.colors.accent.bookmark}
                    selectionColor={theme.colors.accent.bookmark}
                  />
                }
                {tweet && type === 'quote' && <ParentTweet tweet={tweet} />}
                {/* Media Picker */}
                {media.length > 0 && <TweetMediaPicker media={media} onRemoveMedia={handleRemoveMedia} />}
              </View>
            </View>
          </ScrollView>

          {/* Reply Restriction Selector */}
          <ReplyRestrictionSelector selectedOption={replyRestriction} onPress={handleOpenReplyModal} />

          {/* Bottom Toolbar */}
          <BottomToolBar
            remainingCharacters={remainingCharacters}
            progressPercentage={progressPercentage}
            onGalleryPress={handleOpenGallery}
            onCameraPress={handleOpenCamera}
            mediaCount={media.length}
          />

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
