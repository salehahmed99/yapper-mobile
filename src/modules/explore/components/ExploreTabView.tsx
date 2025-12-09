import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExploreTab } from '../types';

interface IExploreTabViewProps {
  activeTab: ExploreTab;
  onTabChange: (tab: ExploreTab) => void;
  children: React.ReactNode;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    tabBarContainer: {
      backgroundColor: theme.colors.background.primary,
      borderBottomWidth: theme.borderWidth.thin / 2,
      borderBottomColor: theme.colors.border,
    },
    tabBar: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.sm,
    },
    tab: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      marginRight: theme.spacing.xs,
    },
    tabText: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.medium,
      color: theme.colors.text.secondary,
      lineHeight: theme.typography.sizes.sm * theme.typography.lineHeights.tight,
    },
    activeTab: {
      borderBottomWidth: theme.borderWidth.medium + 1,
      borderBottomColor: theme.colors.text.link,
    },
    activeTabText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.bold,
    },
    contentContainer: {
      flex: 1,
    },
  });

const ExploreTabView: React.FC<IExploreTabViewProps> = ({ activeTab, onTabChange, children }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const tabs: { key: ExploreTab; label: string }[] = [
    { key: 'forYou', label: t('explore.tabs.forYou') },
    { key: 'trending', label: t('explore.tabs.trending') },
    { key: 'news', label: t('explore.tabs.news') },
    { key: 'sports', label: t('explore.tabs.sports') },
    { key: 'entertainment', label: t('explore.tabs.entertainment') },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.tabBarContainer, { paddingTop: insets.top }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.contentContainer}>{children}</View>
    </View>
  );
};

export default ExploreTabView;
