import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { changeCountry } from '@/src/modules/settings/services/yourAccountService';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export const ConfirmCountryChangeScreen: React.FC = () => {
  const { t } = useTranslation();
  const { country } = useLocalSearchParams<{ country: string }>();
  const { goBack } = useNavigation();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleConfirmChange = async () => {
    if (isUpdating || !country) return;

    setIsUpdating(true);
    try {
      await changeCountry(country);
      Toast.show({
        type: 'success',
        text1: t('settings.country.updated'),
        text2: t('settings.country.updated_message'),
      });
      goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('settings.country.update_failed'),
        text2: error instanceof Error ? error?.message : t('settings.country.update_failed_message'),
      });
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    goBack();
  };

  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />
      <TopBar showExitButton={true} onBackPress={() => goBack()} />

      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('settings.country.title')}</Text>
          <Text style={styles.message}>{t('settings.country.message')}</Text>

          <TouchableOpacity
            style={[styles.button, styles.changeButton]}
            onPress={handleConfirmChange}
            disabled={isUpdating}
          >
            <Text style={styles.buttonTextChange}>
              {isUpdating ? t('settings.common.updating') : t('settings.common.change')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button]} onPress={handleCancel} disabled={isUpdating}>
            <Text style={styles.buttonTextCancel}>{t('settings.common.cancel')}</Text>
          </TouchableOpacity>
        </View>
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
      justifyContent: 'flex-start',
      paddingHorizontal: theme.spacing.xxll,
      paddingTop: theme.spacing.xxxl,
    },
    content: {
      alignItems: 'center',
    },
    title: {
      fontSize: theme.typography.sizes.xml,
      fontWeight: theme.typography.weights.bold,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
      color: theme.colors.text.primary,
    },
    message: {
      fontSize: theme.spacing.mdg,
      lineHeight: 20,
      textAlign: 'center',
      marginBottom: theme.spacing.xxll,
      color: theme.colors.text.secondary,
    },
    button: {
      width: '100%',
      height: theme.spacing.xxxxl,
      borderRadius: theme.spacing.xxl,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.background.primary,
    },
    changeButton: {
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.background.inverse,
    },
    buttonTextChange: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.inverse,
    },
    buttonTextCancel: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.link,
    },
  });

export default ConfirmCountryChangeScreen;
