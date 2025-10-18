import AppBar from '@/src/components/shell/AppBar';
import { useUiShell } from '@/src/components/shell/UiShellContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreenDemo() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const { scrollY } = useUiShell();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <AppBar />
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ ...styles.scrollContent }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        <View style={styles.hero}>
          <Text style={styles.title}>Home Demo</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/(profile)')}>
            <Text style={styles.buttonText}>Open Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Lots of filler content to enable scrolling */}
        {Array.from({ length: 20 }).map((_, i) => (
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

const createStyles = (theme: any) =>
  StyleSheet.create({
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
