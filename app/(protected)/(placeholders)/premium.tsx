import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function PremiumPage() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Premium (placeholder)</Text>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    text: { fontSize: 18, color: theme.colors.text.primary },
  });
