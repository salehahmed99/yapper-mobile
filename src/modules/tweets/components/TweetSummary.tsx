import { DEFAULT_AVATAR_URL } from '@/src/constants/defaults';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { Image } from 'expo-image';
import { ArrowLeft } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTweet } from '../hooks/useTweet';
import { useTweetSummary } from '../hooks/useTweetSummary';

interface TweetSummaryProps {
  tweetId: string;
  onBack: () => void;
}

export default function TweetSummary({ tweetId, onBack }: TweetSummaryProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data: tweet, isLoading: isTweetLoading, isError: isTweetError } = useTweet(tweetId);
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
  } = useTweetSummary(tweetId);

  // Check if error is due to tweet being too short (400 error)
  const isTweetTooShort = summaryError && (summaryError as any)?.response?.status === 400;

  if (isTweetLoading) {
    return (
      <SafeAreaView style={styles.container} testID="tweet_summary_loading">
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            testID="tweet_summary_back_button"
          >
            <ArrowLeft size={theme.iconSizes.lg} color={theme.colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle} accessibilityRole="header">
            {t('tweetSummary.title')}
          </Text>
          <View style={styles.placeholderRight} />
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.text.primary} accessibilityLabel="Loading tweet" />
        </View>
      </SafeAreaView>
    );
  }

  if (isTweetError || !tweet) {
    return (
      <SafeAreaView style={styles.container} testID="tweet_summary_error">
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            testID="tweet_summary_back_button"
          >
            <ArrowLeft size={theme.iconSizes.lg} color={theme.colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle} accessibilityRole="header">
            {t('tweetSummary.title')}
          </Text>
          <View style={styles.placeholderRight} />
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.errorText} testID="tweet_summary_error_text">
            {t('tweetSummary.failedToLoad')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderSummaryContent = () => {
    if (isSummaryLoading) {
      return (
        <View style={styles.summaryLoading} testID="summary_loading">
          <ActivityIndicator size="small" color={theme.colors.text.primary} accessibilityLabel="Loading summary" />
          <Text style={styles.loadingText}>{t('tweetSummary.loadingSummary')}</Text>
        </View>
      );
    }

    if (isTweetTooShort) {
      return (
        <View style={styles.errorContainer} testID="summary_too_short">
          <Text style={styles.errorText} accessibilityLabel="Tweet too short for summary">
            {t('tweetSummary.tweetTooShort')}
          </Text>
        </View>
      );
    }

    if (isSummaryError || !summary) {
      return (
        <View style={styles.errorContainer} testID="summary_error">
          <Text style={styles.errorText} accessibilityLabel="Summary failed to load">
            {t('tweetSummary.summaryFailed')}
          </Text>
        </View>
      );
    }

    return (
      <Text style={styles.analysisText} testID="summary_content" accessibilityLabel={`AI Summary: ${summary}`}>
        {summary}
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.container} testID="tweet_summary_screen">
      {/* Header */}
      <View style={styles.header} testID="tweet_summary_header">
        <Pressable
          onPress={onBack}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          testID="tweet_summary_back_button"
        >
          <ArrowLeft size={theme.iconSizes.lg} color={theme.colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle} accessibilityRole="header">
          {t('tweetSummary.title')}
        </Text>
        <View style={styles.placeholderRight} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Tweet Card */}
        <View style={styles.tweetCard} testID="tweet_summary_tweet_card">
          <View style={styles.userInfo}>
            <Image
              source={tweet.user.avatarUrl ? { uri: tweet.user.avatarUrl } : DEFAULT_AVATAR_URL}
              style={styles.avatar}
              accessibilityLabel={`${tweet.user.name}'s avatar`}
            />
            <View style={styles.userDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.name} testID="tweet_author_name">
                  {tweet.user.name}
                </Text>
              </View>
              <Text style={styles.username} testID="tweet_author_username">
                @{tweet.user.username}
              </Text>
            </View>
          </View>
          <Text style={styles.tweetText} testID="tweet_content" accessibilityLabel={`Tweet: ${tweet.content}`}>
            {tweet.content}
          </Text>
        </View>

        {/* Analysis Section */}
        <View style={styles.analysisSection} testID="summary_section">
          <Text style={styles.analysisTitle} accessibilityRole="header">
            {t('tweetSummary.summaryTitle')}
          </Text>
          {renderSummaryContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
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
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: theme.borderWidth.thin,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      padding: theme.spacing.xs,
    },
    headerTitle: {
      fontSize: theme.typography.sizes.lg,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
    },
    placeholderRight: {
      width: theme.spacing.xxxl,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.secondary,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.md,
    },
    tweetCard: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      borderWidth: theme.borderWidth.thin,
      borderColor: theme.colors.border,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    avatar: {
      width: theme.avatarSizes.sm,
      height: theme.avatarSizes.sm,
      borderRadius: theme.borderRadius.xl,
      marginRight: theme.spacing.sm,
    },
    userDetails: {
      flex: 1,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    name: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
    },
    verifiedBadge: {
      width: theme.iconSizesAlt.xs,
      height: theme.iconSizesAlt.xs,
      backgroundColor: theme.colors.text.link,
      borderRadius: theme.borderRadius.full,
      marginLeft: theme.spacing.xs,
    },
    username: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.secondary,
    },
    tweetText: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.primary,
      lineHeight: 22,
    },
    analysisSection: {
      marginTop: theme.spacing.sm,
    },
    analysisTitle: {
      fontSize: theme.typography.sizes.lg,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    bulletPoint: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
      paddingRight: theme.spacing.sm,
    },
    bullet: {
      fontSize: theme.typography.sizes.lg,
      color: theme.colors.text.primary,
      marginRight: theme.spacing.sm,
      marginTop: -theme.spacing.xs,
    },
    analysisText: {
      flex: 1,
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.secondary,
      lineHeight: 22,
    },
    summaryLoading: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.md,
    },
    loadingText: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.secondary,
    },
    errorContainer: {
      paddingVertical: theme.spacing.md,
    },
  });
