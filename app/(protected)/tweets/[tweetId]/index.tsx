import DropdownMenu, { DropdownMenuItem } from '@/src/components/DropdownMenu';
import GrokLogo from '@/src/components/icons/GrokLogo';
import ViewsIcon from '@/src/components/icons/ViewsIcon';
import AppBar from '@/src/components/shell/AppBar';
import { Theme } from '@/src/constants/theme';
import { MediaViewerProvider } from '@/src/context/MediaViewerContext';
import { useTheme } from '@/src/context/ThemeContext';
import MediaViewerModal from '@/src/modules/tweets/components/MediaViewerModal';
import RepliesContainer from '@/src/modules/tweets/containers/RepliesContainer';
import { useTweetActions } from '@/src/modules/tweets/hooks/useTweetActions';
import useTweetDropDownMenu from '@/src/modules/tweets/hooks/useTweetDropDownMenu';
import { useAuthStore } from '@/src/store/useAuthStore';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ArrowRight, MoreHorizontal, Trash2 } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, I18nManager, Pressable, StyleSheet, Text, View } from 'react-native';

const TweetDetailsScreen = () => {
  const { tweetId, tweetUserId } = useLocalSearchParams<{ tweetId: string; tweetUserId: string }>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);
  const user = useAuthStore((state) => state.user);
  const isRTL = I18nManager.isRTL;
  const handleGrokPress = () => {
    router.push({
      pathname: '/(protected)/tweet-summary',
      params: { tweetId: tweetId },
    });
  };

  const { deletePostMutation } = useTweetActions();
  const handleDelete = (tweetId: string) => {
    deletePostMutation.mutate({ tweetId });
  };

  const handleDeletePress = (tweetId: string) => {
    Alert.alert(t('tweets.deleteConfirmation.title'), t('tweets.deleteConfirmation.message'), [
      {
        text: t('tweets.deleteConfirmation.cancel'),
        style: 'cancel',
      },
      {
        text: t('tweets.deleteConfirmation.delete'),
        style: 'destructive',
        onPress: () => handleDelete(tweetId),
      },
    ]);
  };

  const handleViewPostInteractions = (tweetId: string, ownerId: string) => {
    // TODO: Implement view post interactions functionality
    router.push({
      pathname: '/(protected)/tweets/[tweetId]/activity',
      params: {
        tweetId: tweetId,
        ownerId: ownerId,
      },
    });
  };
  const { menuVisible, menuPosition, moreButtonRef, handleMorePress, setMenuVisible } = useTweetDropDownMenu();

  const menuItems: DropdownMenuItem[] = [
    {
      label: t('tweetActivity.viewPostInteractions'),
      onPress: () => {
        handleViewPostInteractions(tweetId, tweetUserId);
      },
      icon: <ViewsIcon size={theme.iconSizes.md} stroke={theme.colors.text.primary} strokeWidth={0} />,
    },
  ];

  if (tweetUserId === user?.id) {
    menuItems.push({
      label: t('tweets.deletePost'),
      onPress: () => handleDeletePress(tweetId),
      icon: <Trash2 size={theme.iconSizes.md} stroke={theme.colors.text.primary} />,
    });
  }
  return (
    <MediaViewerProvider>
      <View style={styles.container}>
        <AppBar
          children={<Text style={styles.appBarTitle}>{t('tweets.full_tweet.title')}</Text>}
          leftElement={
            <Pressable
              onPress={() => router.back()}
              style={styles.headerButton}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              {isRTL ? (
                <ArrowRight size={theme.iconSizesAlt.xl} color={theme.colors.text.primary} />
              ) : (
                <ArrowLeft size={theme.iconSizesAlt.xl} color={theme.colors.text.primary} />
              )}
            </Pressable>
          }
          rightElement={
            <View style={styles.headerRightActions}>
              <Pressable
                onPress={handleGrokPress}
                style={styles.headerButton}
                accessibilityLabel="Grok"
                accessibilityRole="button"
              >
                <GrokLogo size={theme.iconSizesAlt.xl} color={theme.colors.text.primary} />
              </Pressable>
              <Pressable
                onPress={handleMorePress}
                hitSlop={8}
                ref={moreButtonRef}
                style={styles.headerButton}
                accessibilityLabel="More options"
                accessibilityRole="button"
              >
                <MoreHorizontal size={theme.iconSizesAlt.xl} color={theme.colors.text.primary} />
              </Pressable>
            </View>
          }
        />
        <DropdownMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          items={menuItems}
          position={menuPosition}
        />
        <RepliesContainer tweetId={tweetId} />
        <MediaViewerModal />
      </View>
    </MediaViewerProvider>
  );
};

export default TweetDetailsScreen;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    appBarTitle: {
      fontSize: theme.typography.sizes.lg,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
    },
    headerRightActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingEnd: theme.spacing.md,
    },
    headerButton: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
