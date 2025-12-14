import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import { SettingsSection } from '@/src/modules/settings/components/SettingsSection';
import { SettingsTopBar } from '@/src/modules/settings/components/SettingsTopBar';
import { getYourAccountData } from '@/src/modules/settings/components/settingsConfig';
import { ISettingsItem } from '@/src/modules/settings/types/types';
import { useAuthStore } from '@/src/store/useAuthStore';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const YourAccountScreen: React.FC = () => {
  const { t } = useTranslation();
  const YOUR_ACCOUNT_DATA = useMemo(() => getYourAccountData(t), [t]);
  const user = useAuthStore((state) => state.user);
  const { theme, isDark } = useTheme();
  const { navigate, goBack } = useNavigation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleItemPress = (item: ISettingsItem) => {
    navigate(`/(protected)/(settings)/your-account/${item.route}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />
      <View style={styles.container}>
        {/* Header */}
        <SettingsTopBar
          title={t('settings.your_account.title')}
          subtitle={`@${user?.username}`}
          onBackPress={() => goBack()}
        />

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{t('settings.your_account.description')}</Text>
        </View>

        {/* Settings List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <SettingsSection items={YOUR_ACCOUNT_DATA} onItemPress={handleItemPress} showIcons={true} />
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
    descriptionContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
    },
    descriptionText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
      lineHeight: 20,
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      flexGrow: 1,
    },
  });

export default YourAccountScreen;
