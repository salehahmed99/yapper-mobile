import React, { useMemo, useState } from 'react';
import { View, StyleSheet, StatusBar, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { changeCountry } from '@/src/modules/settings/services/yourAccountService';
import { Theme } from '@/src/constants/theme';
import Toast from 'react-native-toast-message';
import TopBar from '@/src/modules/auth/components/shared/TopBar';

export const ConfirmCountryChangeScreen: React.FC = () => {
  const { country } = useLocalSearchParams<{ country: string }>();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleConfirmChange = async () => {
    if (isUpdating || !country) return;

    setIsUpdating(true);
    try {
      await changeCountry(country);
      Toast.show({
        type: 'success',
        text1: 'Country Updated',
        text2: 'Your country has been updated successfully',
      });
      router.back();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Failed to update country. Please try again later.',
      });
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />
      <TopBar showExitButton={true} onBackPress={() => router.back()} />

      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Change country?</Text>
          <Text style={styles.message}>This will customize your X experience based on the country you live in.</Text>

          <TouchableOpacity
            style={[styles.button, styles.changeButton]}
            onPress={handleConfirmChange}
            disabled={isUpdating}
          >
            <Text style={styles.buttonTextChange}>{isUpdating ? 'Updating...' : 'Change'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button]} onPress={handleCancel} disabled={isUpdating}>
            <Text style={styles.buttonTextCancel}>Cancel</Text>
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
