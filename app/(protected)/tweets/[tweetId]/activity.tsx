import CustomTabView from '@/src/components/CustomTabView';
import { ThemedText } from '@/src/components/ThemedText';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import FollowButton from '@/src/modules/user_list/components/FollowButton';
import UserList from '@/src/modules/user_list/components/UserList';
import { IUser } from '@/src/types/user';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TweetActivityScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const router = useRouter();
  const { tweetId } = useLocalSearchParams<{ tweetId: string }>();
  const insets = useSafeAreaInsets();

  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const routes = [
    { key: 'reposts', title: t('tweetActivity.tabs.reposts') },
    { key: 'quotes', title: t('tweetActivity.tabs.quotes') },
    { key: 'likers', title: t('tweetActivity.tabs.likers') },
  ];

  const renderTabContent = () => {
    const listType = activeTabIndex === 2 ? 'likes' : 'reposts';
    return (
      <UserList
        key={`${listType}-${tweetId}`}
        type={listType}
        tweetId={tweetId || ''}
        renderAction={(user: IUser) => <FollowButton user={user} />}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} accessibilityLabel="back_button" style={styles.backButton}>
            <ChevronLeft size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>{t('tweetActivity.title')}</ThemedText>
          <View style={styles.placeholder} />
        </View>
      </View>
      <View style={styles.tabViewWrapper}>
        <CustomTabView routes={routes} index={activeTabIndex} onIndexChange={setActiveTabIndex} scrollable={false} />
      </View>
      <View style={styles.content}>{renderTabContent()}</View>
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
    tabViewWrapper: {
      borderBottomWidth: theme.borderWidth.thin / 2,
      borderBottomColor: theme.colors.border,
    },
    content: {
      flex: 1,
    },
  });
