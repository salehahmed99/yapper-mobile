import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import { SettingsSearchBar } from '@/src/modules/settings/components/SettingsSearchBar';
import { SettingsSection } from '@/src/modules/settings/components/SettingsSection';
import { SettingsTopBar } from '@/src/modules/settings/components/SettingsTopBar';
import { getSettingsData } from '@/src/modules/settings/components/settingsConfig';
import { ISettingsItem } from '@/src/modules/settings/types/types';
import { useAuthStore } from '@/src/store/useAuthStore';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const SETTINGS_DATA = useMemo(() => getSettingsData(t), [t]);
  const { navigate, replace } = useNavigation();
  const handleItemPress = (item: ISettingsItem) => {
    if (item.route) {
      navigate(`/(protected)/(settings)/${item.route}`);
    }
  };

  const user = useAuthStore((state) => state.user);
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.container}>
        {/* Header */}
        <SettingsTopBar
          title={t('settings.main.title')}
          subtitle={`@${user?.username}`}
          onBackPress={() => replace('/(protected)')}
        />

        {/* Search Bar */}
        <SettingsSearchBar />

        {/* Settings List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <SettingsSection items={SETTINGS_DATA} onItemPress={handleItemPress} />
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
  });

export default SettingsScreen;
