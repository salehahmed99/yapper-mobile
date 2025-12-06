import React, { useMemo } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import CountryPicker, { Country } from '@/src/components/CountryPicker';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useTheme } from '@/src/context/ThemeContext';
import { Theme } from '@/src/constants/theme';

export const EditCountryScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const initialCountry = user?.country ? { name: user.country } : null;

  const handleCountrySelect = (country: Country) => {
    router.push({
      pathname: '/(protected)/(settings)/your-account/account-information/confirm-country-change',
      params: { country: country.name },
    });
  };

  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />
      <View style={styles.container}>
        <CountryPicker
          initialCountry={initialCountry}
          onSelect={handleCountrySelect}
          showBackButton={true}
          onBack={() => router.back()}
          placeholder="Search"
        />
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
    },
  });
export default EditCountryScreen;
