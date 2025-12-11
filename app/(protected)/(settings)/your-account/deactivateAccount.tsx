import { DEFAULT_AVATAR_URL } from '@/src/constants/defaults';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { SettingsTopBar } from '@/src/modules/settings/components/SettingsTopBar';
import { useAuthStore } from '@/src/store/useAuthStore';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const DeactivateAccountScreen: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleDeactivate = () => {
    router.push('/(protected)/(settings)/your-account/confirmDeactivate');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SettingsTopBar title={t('settings.deactivate.title')} onBackPress={() => router.back()} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Section */}
        <View style={styles.userSection}>
          <Image
            source={user?.avatarUrl ? { uri: user.avatarUrl } : { uri: DEFAULT_AVATAR_URL }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.displayName}>{user?.name || 'User'}</Text>
            <Text style={styles.username}>@{user?.username || 'username'}</Text>
          </View>
        </View>

        {/* Main Warning Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.deactivate.warning_title')}</Text>
          <Text style={styles.sectionText}>{t('settings.deactivate.warning_message')}</Text>
        </View>

        {/* What else you should know Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.deactivate.else_title')}</Text>

          <Text style={styles.sectionText}>
            {t('settings.deactivate.else_message_1')}{' '}
            <Text style={styles.link}>{t('settings.deactivate.else_link_1')}</Text>.
          </Text>

          <Text style={styles.sectionText}>
            {t('settings.deactivate.else_message_2')}{' '}
            <Text style={styles.link}>{t('settings.deactivate.else_link_2')}</Text>{' '}
            {t('settings.deactivate.else_message_3')}
          </Text>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.deactivateButton}
          onPress={handleDeactivate}
          activeOpacity={0.7}
          accessibilityLabel="Deactivate button"
          testID="deactivate-button"
        >
          <Text style={styles.deactivateButtonText}>{t('settings.deactivate.button')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      paddingBottom: 100,
    },
    userSection: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 12,
    },
    userInfo: {
      flex: 1,
    },
    displayName: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    username: {
      fontSize: 15,
      color: theme.colors.text.secondary,
    },
    section: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: 12,
    },
    sectionText: {
      fontSize: 15,
      color: theme.colors.text.primary,
      lineHeight: 20,
      marginBottom: 16,
    },
    link: {
      color: theme.colors.text.link,
    },
    spacer: {
      height: 20,
    },
    buttonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.background.primary,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    deactivateButton: {
      backgroundColor: 'transparent',
      paddingVertical: 14,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deactivateButtonText: {
      color: '#f4212e',
      fontSize: 16,
      fontWeight: '700',
    },
  });

export default DeactivateAccountScreen;
