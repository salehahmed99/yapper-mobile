import ActivityLoader from '@/src/components/ActivityLoader';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { AnimatedTextInput } from '@/src/modules/settings/components/AnimatedTextInput';
import { confirmCurrentPassword, deleteAccount } from '@/src/modules/settings/services/yourAccountService';
import { isPasswordValid } from '@/src/modules/settings/utils/passwordValidation';
import { useAuthStore } from '@/src/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export const ConfirmDeactivateScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const logOut = useAuthStore((state) => state.logout);

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDeactivate = async () => {
    if (!password) {
      Toast.show({
        type: 'error',
        text1: t('settings.confirm_deactivate.password_required'),
        text2: t('settings.confirm_deactivate.password_required_message'),
      });
      return;
    }

    setIsLoading(true);
    try {
      const isConfirmed = await confirmCurrentPassword({ password });
      if (!isConfirmed) {
        Toast.show({
          type: 'error',
          text1: t('settings.confirm_deactivate.incorrect_password'),
          text2: t('settings.confirm_deactivate.incorrect_password_message'),
        });
        setIsLoading(false);
        return;
      }

      // Proceed with account deactivation
      const isDeActivated = await deleteAccount();
      if (!isDeActivated) {
        throw new Error('Account deactivation failed. Please try again later.');
      }

      Toast.show({
        type: 'success',
        text1: t('settings.confirm_deactivate.deactivated_title'),
        text2: t('settings.confirm_deactivate.deactivated_message'),
      });

      await logOut(true);
      router.replace('/(auth)/landing-screen');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('settings.confirm_deactivate.failed_title'),
        text2: error?.message || t('settings.confirm_deactivate.failed_message'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="close" size={theme.typography.sizes.xml} color={theme.colors.text.tertiary} />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          {isDark ? (
            <Image source={require('@/assets/images/Yapper-Black.png')} style={styles.logo} resizeMode="contain" />
          ) : (
            <Image source={require('@/assets/images/Yapper-White.png')} style={styles.logo} resizeMode="contain" />
          )}
        </View>

        {/* Title and Description */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{t('settings.confirm_deactivate.title')}</Text>
          <Text style={styles.description}>{t('settings.confirm_deactivate.description')}</Text>
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <AnimatedTextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={t('settings.password.password_placeholder')}
            showPasswordToggle
            accessibilityLabel="Password input"
            testID="password-input"
          />
        </View>
      </View>

      {/* Bottom Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.deactivateButton,
            (!password || !isPasswordValid(password)) && styles.deactivateButtonDisabled,
          ]}
          onPress={handleDeactivate}
          disabled={!password || !isPasswordValid(password) || isLoading}
          activeOpacity={0.7}
          accessibilityLabel="Deactivate button"
          testID="deactivate-button"
        >
          <ActivityLoader visible={isLoading} />
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
    closeButton: {
      position: 'absolute',
      top: theme.spacing.xxxxl + 2,
      left: theme.spacing.lg,
      zIndex: 10,
      width: theme.spacing.xxxl,
      height: theme.spacing.xxxl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xxll,
      paddingBottom: 100,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xxxxxl,
    },
    logo: {
      width: theme.spacing.xxxxl,
      height: theme.spacing.xxxxl,
      backgroundColor: 'transparent',
    },
    textContainer: {
      marginBottom: theme.spacing.xxll,
    },
    title: {
      fontSize: theme.typography.sizes.xml,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    description: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
      lineHeight: 20,
    },
    inputContainer: {
      marginBottom: theme.spacing.xxl,
    },
    inputLabel: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    buttonContainer: {
      position: 'absolute',
      bottom: theme.spacing.xxll,
      right: theme.spacing.lg,
      left: undefined,
      paddingHorizontal: 0,
      backgroundColor: 'transparent',
    },
    deactivateButton: {
      borderWidth: theme.borderWidth.thin,
      borderColor: theme.colors.error,
      backgroundColor: 'black',
      paddingVertical: theme.spacing.md - 2,
      paddingHorizontal: theme.spacing.mdg,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
    },
    deactivateButtonDisabled: {
      borderColor: theme.colors.text.tertiary,
      opacity: 0.5,
    },
    deactivateButtonText: {
      color: theme.colors.error,
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.bold,
    },
  });

export default ConfirmDeactivateScreen;
