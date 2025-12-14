import { Theme } from '@/src/constants/theme';
import { MediaViewerProvider } from '@/src/context/MediaViewerContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import useSpacing from '@/src/hooks/useSpacing';
import MediaViewerModal from '@/src/modules/tweets/components/MediaViewerModal';
import TweetList from '@/src/modules/tweets/components/TweetList';
import { useBookmarks } from '@/src/modules/tweets/hooks/useBookmarks';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { I18nManager, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookmarksScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { goBack } = useNavigation();
  const { bottom } = useSpacing();
  const isRTL = i18n.language === 'ar' || I18nManager.isRTL;

  const bookmarksQuery = useBookmarks({ limit: 20 });

  // Flatten all pages of bookmarks into a single array
  const bookmarks = React.useMemo(() => {
    return bookmarksQuery.data?.pages.flatMap((page) => page.data) ?? [];
  }, [bookmarksQuery.data]);

  const onRefresh = React.useCallback(() => {
    bookmarksQuery.refetch();
  }, [bookmarksQuery]);

  const onEndReached = React.useCallback(() => {
    if (bookmarksQuery.hasNextPage && !bookmarksQuery.isFetchingNextPage) {
      bookmarksQuery.fetchNextPage();
    }
  }, [bookmarksQuery]);

  return (
    <View style={styles.container} testID="bookmarks_screen_container">
      <MediaViewerProvider>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity
            onPress={() => goBack()}
            style={styles.backButton}
            accessibilityLabel={t('buttons.back')}
            testID="bookmarks_back_button"
          >
            <ArrowLeft
              color={theme.colors.background.inverse}
              size={24}
              style={isRTL ? { transform: [{ rotate: '180deg' }] } : undefined}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle]} testID="bookmarks_header_title">
            {t('bookmarks.title', 'Bookmarks')}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Bookmarks List */}
        <TweetList
          data={bookmarks}
          onRefresh={onRefresh}
          refreshing={bookmarksQuery.isRefetching}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          isLoading={bookmarksQuery.isLoading}
          isFetchingNextPage={bookmarksQuery.isFetchingNextPage}
          topSpacing={0}
          bottomSpacing={bottom}
        />
        <MediaViewerModal />
      </MediaViewerProvider>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.background.primary,
    },
    backButton: {
      padding: theme.spacing.sm,
      marginEnd: theme.spacing.sm,
    },
    headerTitle: {
      flex: 1,
      fontSize: theme.typography.sizes.lg,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
      textAlign: 'center',
    },
    headerSpacer: {
      width: 40, // Balance the back button
    },
  });
