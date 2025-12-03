import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { Image } from 'expo-image';
import { ArrowLeft } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ITweet } from '../types';
import { DEFAULT_AVATAR_URL } from '@/src/constants/defaults';

interface TweetSummaryProps {
  tweet: ITweet;
  onBack: () => void;
}

export default function TweetSummary({ tweet, onBack }: TweetSummaryProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={theme.iconSizes.lg} color={theme.colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Grok</Text>
        <View style={styles.placeholderRight} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Tweet Card */}
        <View style={styles.tweetCard}>
          <View style={styles.userInfo}>
            <Image
              source={tweet.user.avatarUrl ? { uri: tweet.user.avatarUrl } : DEFAULT_AVATAR_URL}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{tweet.user.name}</Text>
              </View>
              <Text style={styles.username}>@{tweet.user.username}</Text>
            </View>
          </View>
          <Text style={styles.tweetText}>{tweet.content}</Text>
        </View>

        {/* Analysis Section */}
        <View style={styles.analysisSection}>
          <Text style={styles.analysisTitle}>Tweet Summary</Text>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.analysisText}>
              This tweet discusses the importance of community giving and gratitude, aligning with the user's focus on
              civic engagement.
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.analysisText}>
              The message has received significant engagement, sparking conversations about leadership and social
              responsibility in the current political climate.
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.analysisText}>
              Posted recently, it reflects a tradition of holiday outreach and contrasts with other prevailing political
              rhetoric.
            </Text>
          </View>
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
  });
