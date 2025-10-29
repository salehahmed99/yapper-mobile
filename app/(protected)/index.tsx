import AppBar from '@/src/components/shell/AppBar';
import { useUiShell } from '@/src/components/shell/UiShellContext';
import type { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const { scrollY } = useUiShell();
  return (
    <View style={styles.container}>
      <AppBar />
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* Lots of filler content to enable scrolling */}
        {Array.from({ length: 30 }).map((_, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardTitle}>{t('home.item', { index: i + 1 })}</Text>
            <Text style={styles.cardBody}>{t('home.sampleContent')}</Text>
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xxl * 5,
      backgroundColor: theme.colors.background.primary,
    },
    hero: {
      padding: theme.spacing.xxl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: theme.typography.sizes.xxl,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
      fontFamily: theme.typography.fonts.semiBold,
    },
    button: {
      backgroundColor: theme.colors.text.link,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    buttonText: {
      color: theme.colors.text.inverse,
      fontFamily: theme.typography.fonts.semiBold,
    },
    card: {
      marginHorizontal: theme.spacing.lg,
      marginVertical: theme.spacing.sm,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.lg,
    },
    cardTitle: {
      color: theme.colors.text.primary,
      fontWeight: '700',
      marginBottom: theme.spacing.sm,
    },
    cardBody: {
      color: theme.colors.text.secondary,
    },
  });
