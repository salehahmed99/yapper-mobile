import { Theme } from '@/src/constants/theme';
import { MediaViewerProvider } from '@/src/context/MediaViewerContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import { useCategoryPosts } from '@/src/modules/explore/hooks/useCategoryPosts';
import MediaViewerModal from '@/src/modules/tweets/components/MediaViewerModal';
import TweetList from '@/src/modules/tweets/components/TweetList';
import { useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
      paddingVertical: theme.spacing.md,
      borderBottomWidth: theme.borderWidth.thin / 2,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      padding: theme.spacing.xs,
      marginRight: theme.spacing.md,
    },
    headerTitle: {
      fontSize: theme.typography.sizes.lg,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
    },
  });

export default function CategoryPostsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { goBack } = useNavigation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ categoryId: string; categoryName: string }>();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const categoryId = params.categoryId || '';
  const categoryName = params.categoryName || t('explore.category', 'Category');

  // Use react-query hook for data fetching and cache updates
  const { data, isLoading, isRefetching, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    useCategoryPosts(categoryId);

  // Flatten paginated data into single array
  const tweets = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data.tweets || []);
  }, [data]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleBack = useCallback(() => {
    goBack();
  }, [goBack]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <MediaViewerProvider>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            accessibilityLabel={t('buttons.back')}
            accessibilityRole="button"
          >
            <ArrowLeft size={theme.iconSizes.md} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{categoryName}</Text>
        </View>

        {/* Tweet List */}
        <TweetList
          data={tweets}
          onRefresh={handleRefresh}
          refreshing={isRefetching}
          onEndReached={handleLoadMore}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          isTabActive={true}
          bottomSpacing={!hasNextPage ? insets.bottom + 60 : 0}
        />

        <MediaViewerModal />
      </MediaViewerProvider>
    </View>
  );
}
