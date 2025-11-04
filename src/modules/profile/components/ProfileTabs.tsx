import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Theme } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';
import CustomTabView, { TabConfig } from './CustomTabView';
import WhoToFollow from './WhoToFollow';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.colors.background.primary },
    placeholderText: {
      textAlign: 'center',
      marginTop: 40,
      fontSize: 16,
      color: theme.colors.text.secondary,
    },
  });

const PostsRoute = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <ScrollView style={styles.page}>
      <WhoToFollow />
      <Text style={styles.placeholderText}>{t('profile.placeholders.tweets')}</Text>
    </ScrollView>
  );
};

const RepliesRoute = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <ScrollView style={styles.page}>
      <WhoToFollow />
      <Text style={styles.placeholderText}>{t('profile.placeholders.tweetsReplies')}</Text>
    </ScrollView>
  );
};

const MediaRoute = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.page}>
      <Text style={styles.placeholderText}>{t('profile.placeholders.media')}</Text>
    </View>
  );
};

const LikesRoute = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.page}>
      <Text style={styles.placeholderText}>{t('profile.placeholders.likes')}</Text>
    </View>
  );
};

export default function ProfileTabs() {
  const { t } = useTranslation();
  const tabs: TabConfig[] = [
    { key: 'tweets', title: t('profile.tabs.tweets'), component: PostsRoute },
    { key: 'tweetsReplies', title: t('profile.tabs.tweetsReplies'), component: RepliesRoute },
    { key: 'media', title: t('profile.tabs.media'), component: MediaRoute },
    { key: 'likes', title: t('profile.tabs.likes'), component: LikesRoute },
  ];

  return <CustomTabView tabs={tabs} scrollEnabled={true} />;
}
