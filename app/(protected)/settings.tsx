import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsPage() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login' as unknown as Parameters<typeof router.replace>[0]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings (placeholder)</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    text: { fontSize: 18, color: theme.colors.text.primary, marginBottom: 20 },
    logoutButton: {
      backgroundColor: theme.colors.error,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 20,
    },
    logoutText: {
      color: theme.colors.text.inverse,
      fontSize: 16,
      fontWeight: '600',
    },
  });
