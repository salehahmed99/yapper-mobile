import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ICreatePostHeaderProps {
  canPost: boolean;
  handleCancel: () => void;
  handlePost: () => void;
}
const CreatePostHeader: React.FC<ICreatePostHeaderProps> = (props) => {
  const { canPost, handleCancel, handlePost } = props;

  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <Pressable
        onPress={handleCancel}
        style={styles.cancelButton}
        accessibilityLabel="create_post_button_cancel"
        testID="create_post_button_cancel"
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </Pressable>
      <Pressable
        onPress={handlePost}
        style={[styles.postButton, !canPost && styles.postButtonDisabled]}
        disabled={!canPost}
        accessibilityLabel="create_post_button_post"
        testID="create_post_button_post"
      >
        <Text style={[styles.postButtonText]}>Post</Text>
      </Pressable>
    </View>
  );
};

export default CreatePostHeader;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xs,
    },
    cancelButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
    },
    cancelButtonText: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.regular,
    },
    postButton: {
      backgroundColor: theme.colors.text.link,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
    },
    postButtonDisabled: {
      backgroundColor: theme.colors.text.link,
      opacity: 0.5,
    },
    postButtonText: {
      fontSize: theme.typography.sizes.sm - 1,
      color: theme.colors.white,
      fontFamily: theme.typography.fonts.bold,
    },
  });
