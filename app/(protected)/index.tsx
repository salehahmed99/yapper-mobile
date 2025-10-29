import AppBar from '@/src/components/shell/AppBar';
import { useUiShell } from '@/src/components/shell/UiShellContext';
import type { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
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
            <Text style={styles.cardTitle}>Item {i + 1}</Text>
            <Text style={styles.cardBody}>
              This is sample content to demonstrate scrolling and bottom navigation opacity.
            </Text>
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
      paddingBottom: 120,
      backgroundColor: theme.colors.background.primary,
    },
    hero: {
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 28,
      color: theme.colors.text.primary,
      marginBottom: 12,
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
      marginHorizontal: 16,
      marginVertical: 8,
      padding: 16,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: 12,
    },
    cardTitle: {
      color: theme.colors.text.primary,
      fontWeight: '700',
      marginBottom: 8,
    },
    cardBody: {
      color: theme.colors.text.secondary,
    },
  });
