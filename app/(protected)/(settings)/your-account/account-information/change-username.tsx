import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import { usernameSchema } from '@/src/modules/auth/schemas/schemas';
import { SettingsTopBar } from '@/src/modules/settings/components/SettingsTopBar';
import { changeUsername } from '@/src/modules/settings/services/yourAccountService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export const ChangeUsernameScreen: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { goBack } = useNavigation();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const validateUsername = (username: string) => {
    if (!username.trim()) {
      setError(null);
      return;
    }

    if (username === user?.username) {
      setError(t('settings.username.error_same'));
      return;
    }

    const result = usernameSchema.safeParse(username);
    if (!result.success) {
      setError(result.error.errors[0]?.message || t('settings.username.error_invalid'));
    } else {
      setError(null);
    }
  };

  const handleChangeUsername = async () => {
    if (!newUsername.trim()) {
      Toast.show({
        type: 'error',
        text1: t('settings.common.error'),
        text2: t('settings.username.empty_error'),
      });
      return;
    }

    if (error) {
      Toast.show({
        type: 'error',
        text1: t('settings.common.error'),
        text2: error,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await changeUsername(newUsername);
      if (!response) {
        Toast.show({
          type: 'error',
          text1: t('settings.common.error'),
          text2: t('settings.username.error_failed'),
        });
        return;
      }
      Toast.show({
        type: 'success',
        text1: t('settings.common.success'),
        text2: t('settings.username.success'),
      });
      goBack();
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: t('settings.common.error'),
        text2: err instanceof Error ? err.message : t('settings.common.unexpected_error'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateDoneButton = () => {
    if (isLoading) return false;
    if (!newUsername.trim()) return false;
    if (newUsername === user?.username) return false;
    if (error) return false;
    return true;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />
      <View style={styles.container}>
        {/* Header */}
        <SettingsTopBar title={t('settings.username.title')} onBackPress={() => goBack()} />

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            {/* Current Username */}
            <View style={styles.section}>
              <Text style={styles.label}>{t('settings.username.current')}</Text>
              <Text style={styles.currentUsername}>@{user?.username}</Text>
            </View>

            {/* New Username Input */}
            <View style={styles.section}>
              <Text style={styles.label}>{t('settings.username.new')}</Text>
              <View
                style={[
                  styles.inputContainer,
                  isFocused && styles.inputContainerFocused,
                  error && styles.inputContainerError,
                ]}
              >
                <Text style={styles.prefix}>@</Text>
                <TextInput
                  style={styles.input}
                  value={newUsername}
                  onChangeText={(text) => {
                    setNewUsername(text);
                    validateUsername(text);
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  editable={!isLoading}
                  placeholder={t('settings.username.placeholder')}
                  placeholderTextColor={theme.colors.text.secondary}
                />
                {error && (
                  <Ionicons name="alert-circle" size={24} color={theme.colors.error} style={styles.errorIcon} />
                )}
              </View>

              {/* Error Message */}
              {error && <Text style={styles.errorMessage}>{error}</Text>}
            </View>
          </View>
        </ScrollView>

        {/* Done Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            // eslint-disable-next-line react-native/no-inline-styles
            style={[styles.doneButton, { opacity: validateDoneButton() ? 1 : 0.5 }]}
            onPress={handleChangeUsername}
            disabled={!validateDoneButton()}
            accessibilityLabel="Done"
            testID="Done_Button"
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.text.primary} />
            ) : (
              <Text style={styles.doneButtonText}>{t('settings.username.done')}</Text>
            )}
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
      backgroundColor: theme.colors.background.primary,
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      flexGrow: 1,
    },
    contentContainer: {
      paddingVertical: theme.spacing.md,
    },
    section: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
    },
    label: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.sm,
    },
    currentUsername: {
      fontSize: theme.typography.sizes.lg,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.secondary,
      borderBottomColor: theme.colors.border,
      borderBottomWidth: theme.borderWidth.thin,
      paddingBottom: theme.spacing.sm,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      position: 'relative',
      borderBottomColor: theme.colors.border,
      borderBottomWidth: 1,
      paddingVertical: theme.spacing.xs,
    },
    inputContainerFocused: {
      borderBottomColor: theme.colors.text.link,
    },
    inputContainerError: {
      borderBottomColor: theme.colors.error,
    },
    prefix: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.primary,
      marginRight: theme.spacing.xs,
    },
    input: {
      flex: 1,
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.primary,
      padding: 0,
    },
    errorIcon: {
      marginLeft: theme.spacing.sm,
    },
    errorMessage: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.error,
      marginTop: theme.spacing.md,
      lineHeight: 20,
    },
    footer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      alignItems: 'flex-end',
      borderTopColor: theme.colors.border,
      borderTopWidth: theme.borderWidth.thin,
    },
    doneButton: {
      backgroundColor: theme.colors.text.link,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.full,
      minWidth: 100,
      alignItems: 'center',
      justifyContent: 'center',
    },
    doneButtonText: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.semiBold,
      color: theme.colors.text.primary,
    },
  });

export default ChangeUsernameScreen;
