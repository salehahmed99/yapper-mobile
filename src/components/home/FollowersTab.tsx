import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useUiShell } from '@/src/context/UiShellContext';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FollowersTab: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const { scrollY } = useUiShell();
  const insets = useSafeAreaInsets();

  return (
    <Animated.ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: theme.ui.appBarHeight + insets.top + theme.ui.tabViewHeight + theme.spacing.sm },
      ]}
      contentInsetAdjustmentBehavior="never"
      scrollIndicatorInsets={{ top: theme.ui.appBarHeight + theme.ui.tabViewHeight, bottom: theme.ui.navHeight }}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
      scrollEventThrottle={16}
    >
      {Array.from({ length: 15 }).map((_, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardTitle}>{`${t('home.tabs.following')} ${i + 1}`}</Text>
          <Text style={styles.cardBody}>{t('home.sampleContent')}</Text>
        </View>
      ))}
    </Animated.ScrollView>
  );
};

export default FollowersTab;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: theme.spacing.xxl * 5, backgroundColor: theme.colors.background.primary },
    card: {
      marginHorizontal: theme.spacing.lg,
      marginVertical: theme.spacing.sm,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.lg,
    },
    cardTitle: { color: theme.colors.text.primary, fontWeight: '700', marginBottom: theme.spacing.sm },
    cardBody: { color: theme.colors.text.secondary },
  });
