import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotFoundPage() {
  const { replace } = useNavigation();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>404 - Page not found</Text>
      <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
        The page you're looking for doesn't exist.
      </Text>

      <TouchableOpacity
        onPress={() => replace('/(protected)')}
        style={[styles.button, { backgroundColor: theme.colors.background.secondary }]}
        accessibilityRole="button"
      >
        <Text style={[styles.buttonText, { color: theme.colors.text.primary }]}>Go home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 20, textAlign: 'center' },
  button: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
  buttonText: { fontSize: 16, fontWeight: '600' },
});
