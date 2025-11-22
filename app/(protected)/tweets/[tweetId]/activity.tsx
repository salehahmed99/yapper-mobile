import { ThemedText } from '@/src/components/ThemedText';
import { Theme } from '@/src/constants/theme';
import { MediaViewerProvider } from '@/src/context/MediaViewerContext';
import { useTheme } from '@/src/context/ThemeContext';
import useSpacing from '@/src/hooks/useSpacing';
import CustomTabView, { TabConfig } from '@/src/modules/profile/components/CustomTabView';
import MediaViewerModal from '@/src/modules/tweets/components/MediaViewerModal';
import TweetQuotesList from '@/src/modules/tweets/components/TweetQuotesList';
import FollowButton from '@/src/modules/user_list/components/FollowButton';
import UserList from '@/src/modules/user_list/components/UserList';
import { useAuthStore } from '@/src/store/useAuthStore';
import { IUser } from '@/src/types/user';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function TweetActivityScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const router = useRouter();
  const { tweetId, ownerId } = useLocalSearchParams<{ tweetId: string; ownerId?: string }>();
  const { bottom } = useSpacing();
  const user = useAuthStore((state) => state.user);
  const fetchAndUpdateUser = useAuthStore((state) => state.fetchAndUpdateUser);

  useEffect(() => {
    if (!user) {
      fetchAndUpdateUser();
    }
  }, [user, fetchAndUpdateUser]);

  const currentUserId = user?.id ?? null;
  const isTweetOwner = ownerId ? ownerId === currentUserId : false;

  const handleUserPress = (selectedUser: IUser) => {
    router.push({
      pathname: '/(protected)/(profile)/[id]',
      params: { id: selectedUser.id },
    });
  };

  const RepostsTab = useMemo(
    () =>
      function RepostsTab() {
        return (
          <UserList
            key={`reposts-${tweetId}`}
            type="reposts"
            tweetId={tweetId || ''}
            onUserPress={handleUserPress}
            renderAction={(user: IUser) => <FollowButton user={user} />}
          />
        );
      },
    [tweetId],
  );

  const QuotesTab = useMemo(
    () =>
      function QuotesTab() {
        return <TweetQuotesList tweetId={tweetId || ''} />;
      },
    [tweetId],
  );

  const LikersTab = useMemo(
    () =>
      function LikersTab() {
        return (
          <UserList
            key={`likers-${tweetId}`}
            type="likes"
            tweetId={tweetId || ''}
            onUserPress={handleUserPress}
            renderAction={(user: IUser) => <FollowButton user={user} />}
          />
        );
      },
    [tweetId],
  );

  const tabs: TabConfig[] = useMemo(() => {
    const base: TabConfig[] = [
      { key: 'reposts', title: t('tweetActivity.tabs.reposts'), component: RepostsTab },
      { key: 'quotes', title: t('tweetActivity.tabs.quotes'), component: QuotesTab },
    ];
    if (isTweetOwner) {
      base.push({ key: 'likers', title: t('tweetActivity.tabs.likers'), component: LikersTab });
    }
    return base;
  }, [t, isTweetOwner, RepostsTab, QuotesTab, LikersTab]);

  return (
    <MediaViewerProvider>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} accessibilityLabel="back_button" style={styles.backButton}>
              <ChevronLeft size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <ThemedText style={styles.title}>{t('tweetActivity.title')}</ThemedText>
            <View style={styles.placeholder} />
          </View>
        </View>
        <CustomTabView tabs={tabs} scrollEnabled={false} />
        <View style={{ height: bottom }} />
        <MediaViewerModal />
      </View>
    </MediaViewerProvider>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
      paddingTop: theme.spacing.xxxxl,
    },
    header: {
      backgroundColor: theme.colors.background.primary,
      borderBottomWidth: theme.borderWidth.thin / 2,
      borderBottomColor: theme.colors.border,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: theme.ui.appBarHeight,
      paddingHorizontal: theme.spacing.md,
    },
    backButton: {
      width: theme.ui.sideContainerWidth,
      height: theme.ui.sideContainerWidth,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      flex: 1,
      fontSize: theme.typography.sizes.lg,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
      textAlign: 'center',
    },
    placeholder: {
      width: theme.ui.sideContainerWidth,
    },
  });
