import ActivityLoader from '@/src/components/ActivityLoader';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { changeLanguage } from '@/src/i18n';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { changeLanguage as changeLanguageBackend } from '@/src/modules/settings/services/languagesService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

type Language = {
  code: string;
  name: string;
  nativeName: string;
};

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
];

export const LanguagesScreen: React.FC = () => {
  const { i18n, t } = useTranslation();
  const setLanguage = useAuthStore((state) => state.setLanguage);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(i18n.language || 'en');
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
  };

  const handleSkip = () => {
    router.back();
  };

  const handleNext = async () => {
    if (selectedLanguage === i18n.language) {
      router.back();
      return;
    }

    setIsLoading(true);
    try {
      // 1. Update auth store
      setLanguage(selectedLanguage);

      // 2. Update backend (source of truth for logged-in users)
      await changeLanguageBackend(selectedLanguage);

      // 3. Update local i18n at the end since this will trigger app reload
      await changeLanguage(selectedLanguage);

      Toast.show({
        type: 'success',
        text1: t('settings.languages.updated_title'),
        text2: t('settings.languages.updated_message'),
      });

      router.back();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('settings.languages.update_failed'),
        text2: t('settings.languages.update_failed_message'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <>
      <ActivityLoader visible={isLoading} />
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background.primary}
        />
        <TopBar onBackPress={() => router.back()} showExitButton={false} />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>{t('settings.languages.title')}</Text>
            <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
              {t('settings.languages.description')}
            </Text>

            <View style={styles.languageList}>
              {LANGUAGES.map((language) => {
                const isSelected = selectedLanguage === language.code;

                return (
                  <TouchableOpacity
                    key={language.code}
                    style={[styles.languageItem, { borderBottomColor: theme.colors.border }]}
                    onPress={() => handleLanguageSelect(language.code)}
                    disabled={isLoading}
                  >
                    <Text style={[styles.languageText, { color: theme.colors.text.primary }]}>
                      {language.name} - {language.nativeName}
                    </Text>
                    {isSelected && (
                      <View style={[styles.checkbox, { backgroundColor: theme.colors.text.primary }]}>
                        <Check size={16} color={theme.colors.background.primary} strokeWidth={3} />
                      </View>
                    )}
                    {!isSelected && <View style={[styles.checkbox, { borderColor: theme.colors.border }]} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <BottomBar
          leftButton={{
            label: t('settings.common.skip'),
            onPress: handleSkip,
            enabled: !isLoading,
            visible: true,
            type: 'secondary',
          }}
          rightButton={{
            label: t('settings.common.next'),
            onPress: handleNext,
            enabled: !isLoading,
            visible: true,
            type: 'primary',
          }}
        />
      </SafeAreaView>
    </>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      marginBottom: theme.spacing.md,
      fontFamily: theme.typography.fonts.bold,
    },
    description: {
      fontSize: theme.typography.sizes.md,
      lineHeight: 20,
      marginBottom: theme.spacing.xl,
      fontFamily: theme.typography.fonts.regular,
    },
    languageList: {
      marginTop: theme.spacing.md,
    },
    languageItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      borderBottomWidth: 1,
    },
    languageText: {
      fontSize: theme.typography.sizes.lg,
      fontFamily: theme.typography.fonts.regular,
      flex: 1,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 4,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default LanguagesScreen;
