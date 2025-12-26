import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import { SettingsSection } from '@/src/modules/settings/components/SettingsSection';
import { SettingsTopBar } from '@/src/modules/settings/components/SettingsTopBar';
import { ISettingsItem } from '@/src/modules/settings/types/types';
import { useAuthStore } from '@/src/store/useAuthStore';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const getAccessibilityDisplayData = (t: (key: string) => string): ISettingsItem[] => [
  {
    id: 'languages',
    title: t('settings.languages.title'),
    icon: 'globe-outline',
    iconFamily: 'Ionicons',
    description: t('settings.languages.description'),
    route: 'languages',
  },
];

export const AccessibilityDisplayLanguagesScreen: React.FC = () => {
  const { t } = useTranslation();
  const ACCESSIBILITY_DISPLAY_DATA = getAccessibilityDisplayData(t);
  const { navigate } = useNavigation();
  const handleItemPress = (item: ISettingsItem) => {
    if (item.route) {
      navigate(`/(protected)/(settings)/accessibility-display-languages/${item.route}`);
    }
  };

  const user = useAuthStore((state) => state.user);
  const { theme, isDark } = useTheme();
  const { goBack } = useNavigation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />
      <View style={styles.container}>
        <SettingsTopBar
          title={t('settings.accessibility.title')}
          subtitle={`@${user?.username}`}
          onBackPress={() => goBack()}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.descriptionContainer}>
            <View style={styles.description} />
          </View>
          <SettingsSection items={ACCESSIBILITY_DISPLAY_DATA} onItemPress={handleItemPress} />
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
    descriptionContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    description: {
      marginBottom: theme.spacing.sm,
    },
  });

export default AccessibilityDisplayLanguagesScreen;
