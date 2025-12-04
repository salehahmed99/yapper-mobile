import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { SettingsTopBar } from '@/src/modules/settings/components/SettingsTopBar';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useTheme } from '@/src/context/ThemeContext';
import { Theme } from '@/src/constants/theme';

export const AccountInformationScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleLogout = () => {
    Alert.alert('Log out', 'Logging out will remove all yapper data from this device', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await logout(false);
          router.replace('/(auth)/landing-screen');
        },
      },
    ]);
  };

  const handleLogoutAll = () => {
    Alert.alert('Log out', 'Logging out will remove all yapper data from all connected devices', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Log out All',
        style: 'destructive',
        onPress: async () => {
          await logout(true);
          router.replace('/(auth)/landing-screen');
        },
      },
    ]);
  };

  const InfoRow = ({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) => (
    <TouchableOpacity
      style={styles.infoRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      accessibilityLabel={label}
      testID={label.replace(' ', '_')}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />
      <View style={styles.container}>
        {/* Header */}
        <SettingsTopBar title="Account information" subtitle={`@${user?.username}`} onBackPress={() => router.back()} />

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <InfoRow
              label="Username"
              value={`@${user?.username}`}
              onPress={() => router.push('/(protected)/(settings)/your-account/account-information/change-username')}
            />

            <InfoRow label="Email" value={user?.email || 'Add'} />

            <InfoRow
              label="Country"
              value={user?.country || 'Add'}
              onPress={() => router.push('/(protected)/(settings)/your-account/account-information/edit-country')}
            />

            <View style={styles.helperTextContainer}>
              <Text style={styles.helperText}>Select the country you live in.</Text>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              accessibilityLabel="Log out"
              testID="Logout_Button"
            >
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogoutAll}
              accessibilityLabel="Log out All"
              testID="Logout_All_Button"
            >
              <Text style={styles.logoutText}>Log out All</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      flexGrow: 1,
    },
    infoRow: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    label: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.primary,
    },
    value: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.secondary,
    },
    helperTextContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    helperText: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.secondary,
      lineHeight: 20,
    },
    logoutButton: {
      marginTop: theme.spacing.mdg,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'flex-start',
    },
    logoutText: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.semiBold,
      color: theme.colors.error,
    },
  });

export default AccountInformationScreen;
