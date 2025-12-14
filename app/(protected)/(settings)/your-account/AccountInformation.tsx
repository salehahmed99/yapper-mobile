import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import { SettingsTopBar } from '@/src/modules/settings/components/SettingsTopBar';
import { useAuthStore } from '@/src/store/useAuthStore';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const AccountInformationScreen: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { theme, isDark } = useTheme();
  const { navigate, replace, goBack } = useNavigation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleLogout = () => {
    Alert.alert(t('settings.account_info.logout_title'), t('settings.account_info.logout_message'), [
      {
        text: t('settings.common.cancel'),
        style: 'cancel',
      },
      {
        text: t('settings.account_info.logout_button'),
        style: 'destructive',
        onPress: async () => {
          await logout(false);
          replace('/(auth)/landing-screen');
        },
      },
    ]);
  };

  const handleLogoutAll = () => {
    Alert.alert(t('settings.account_info.logout_title'), t('settings.account_info.logout_all_message'), [
      {
        text: t('settings.common.cancel'),
        style: 'cancel',
      },
      {
        text: t('settings.account_info.logout_all_button'),
        style: 'destructive',
        onPress: async () => {
          await logout(true);
          replace('/(auth)/landing-screen');
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
        <SettingsTopBar
          title={t('settings.account_info.title')}
          subtitle={`@${user?.username}`}
          onBackPress={() => goBack()}
        />

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <InfoRow
              label={t('settings.account_info.username_label')}
              value={`@${user?.username}`}
              onPress={() => navigate('/(protected)/(settings)/your-account/account-information/change-username')}
            />

            <InfoRow
              label={t('settings.account_info.email_label')}
              value={user?.email || t('settings.account_info.add_label')}
              onPress={() =>
                navigate({
                  pathname: '/(protected)/(settings)/your-account/verify-password',
                  params: { returnTo: '/(protected)/(settings)/your-account/account-information/update-email' },
                })
              }
            />

            <InfoRow
              label={t('settings.account_info.country_label')}
              value={user?.country || t('settings.account_info.add_label')}
              onPress={() => navigate('/(protected)/(settings)/your-account/account-information/edit-country')}
            />

            <View style={styles.helperTextContainer}>
              <Text style={styles.helperText}>{t('settings.account_info.country_helper')}</Text>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              accessibilityLabel="Log out"
              testID="Logout_Button"
            >
              <Text style={styles.logoutText}>{t('settings.account_info.logout_button')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogoutAll}
              accessibilityLabel="Log out All"
              testID="Logout_All_Button"
            >
              <Text style={styles.logoutText}>{t('settings.account_info.logout_all_button')}</Text>
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
