import ActivityLoader from '@/src/components/ActivityLoader';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { usernameSchema } from '@/src/modules/auth/schemas/schemas';
import { useSignUpStore } from '@/src/modules/auth/store/useSignUpStore';
import { updateUserName } from '@/src/services/userService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';

const UserNameScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Zustand store
  const email = useSignUpStore((state) => state.email);
  const userNames = useSignUpStore((state) => state.userNames);

  const [username, setUsername] = useState(userNames[0] || '');
  const [isFocused, setIsFocused] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isNextEnabled, setNextEnabled] = useState(true);
  const labelPosition = useState(new Animated.Value(1))[0];

  const styles = useMemo(() => createStyles(theme), [theme]);

  const setSkipRedirect = useAuthStore((state) => state.setSkipRedirect);

  // Redirect if no email or usernames (user shouldn't be here)
  useEffect(() => {
    if (!email || !userNames || userNames.length === 0) {
      router.replace('/(auth)/sign-up/create-account-screen');
    }
  }, [email, userNames]);

  const shouldFloat = isFocused || username.length > 0;

  useEffect(() => {
    Animated.timing(labelPosition, {
      toValue: shouldFloat ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [shouldFloat, labelPosition]);

  const labelStyle = {
    position: 'absolute' as const,
    left: theme.spacing.lg,
    top: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -10],
    }),
    fontSize: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [17, 13],
    }),
    color: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.text.secondary, isFocused ? theme.colors.text.link : theme.colors.text.secondary],
    }),
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: theme.spacing.xs,
    zIndex: 1,
  };

  const handleShowMore = () => {
    setShowMore(!showMore);
  };

  const handleSelectUsername = (selectedUsername: string) => {
    setUsername(selectedUsername.replace('@', ''));
  };

  const handleNext = async () => {
    if (!username) {
      Toast.show({
        type: 'error',
        text1: t('auth.signUp.userName.errors.usernameRequired'),
        text2: t('auth.signUp.userName.errors.selectOrEnter'),
      });
      return;
    }
    if (!usernameSchema.safeParse(username).success) {
      Toast.show({
        type: 'error',
        text1: t('auth.signUp.userName.errors.invalidUsername'),
        text2: t('auth.signUp.userName.errors.usernameFormat'),
      });
      return;
    }
    const userNamesParam = useSignUpStore.getState().userNames;
    if (username === userNamesParam[0]) {
      setSkipRedirect(false);
      router.replace('/(protected)');
      return;
    }

    setLoading(true);
    setNextEnabled(false);
    try {
      await updateUserName(username);

      Toast.show({
        type: 'success',
        text1: t('auth.signUp.userName.success.usernameSet'),
        text2: t('auth.signUp.userName.success.yourUsername', { username }),
      });
      setSkipRedirect(false);
      router.replace('/(protected)');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('auth.signUp.userName.errors.error'),
        text2: (error as Error).message,
      });
    } finally {
      setLoading(false);
      setNextEnabled(true);
    }
  };

  const handleSkip = () => {
    router.push('/(protected)');
  };

  return (
    <View style={styles.container}>
      <ActivityLoader visible={loading} />
      <TopBar showExitButton={false} />
      <View style={styles.scrollableContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('auth.signUp.userName.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.signUp.userName.subtitle')}</Text>
        </View>

        <View style={styles.inputWrapper}>
          <Animated.Text style={labelStyle}>{t('auth.signUp.userName.usernameLabel')}</Animated.Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                isFocused && styles.inputFocused,
                username.length > 0 && username.length < 3 && styles.inputError,
              ]}
              value={username}
              onChangeText={setUsername}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardAppearance="dark"
              accessibilityLabel="username-input"
            />
            {username.length >= 3 && usernameSchema.safeParse(username).success && (
              <View style={styles.checkmark}>
                <Check size={16} color="#FFFFFF" strokeWidth={3} />
              </View>
            )}
          </View>
          {username.length > 0 && username.length < 3 && (
            <Text style={styles.errorText}>{t('auth.signUp.userName.errors.minLength')}</Text>
          )}
        </View>

        <View style={showMore ? styles.expandedSuggestionsContainer : styles.suggestionsWrapper}>
          {userNames.slice(0, showMore ? userNames.length : 2).map((item: string, index: number, array: string[]) => (
            <View key={`${item}-${index}`} style={styles.suggestionItem}>
              <TouchableOpacity onPress={() => handleSelectUsername(item)} accessibilityLabel={`suggestion-${item}`}>
                <Text style={[styles.suggestionText]}>{item}</Text>
              </TouchableOpacity>

              {index < array.length - 1 && <Text style={styles.commaText}>, </Text>}
            </View>
          ))}
        </View>

        {userNames.length > 2 && (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={handleShowMore}
            accessibilityLabel="show-more-button"
          >
            <Text style={styles.showMoreText}>
              {showMore ? t('auth.signUp.userName.showLess') : t('auth.signUp.userName.showMore')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <BottomBar
        rightButton={{
          label: t('buttons.next'),
          onPress: handleNext,
          enabled: isNextEnabled && username.length >= 3 && usernameSchema.safeParse(username).success,
          visible: true,
          type: 'primary',
        }}
        leftButton={{
          label: t('auth.signUp.userName.skipButton'),
          onPress: handleSkip,
          enabled: true,
          visible: true,
          type: 'secondary',
        }}
      />
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollableContent: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xxl,
      paddingBottom: theme.spacing.lg,
    },
    header: {
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: theme.typography.sizes.xml,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
      lineHeight: theme.typography.lineHeights.relaxed * theme.typography.sizes.xml,
    },
    subtitle: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.secondary,
      lineHeight: 20,
    },
    inputWrapper: {
      position: 'relative',
      marginBottom: theme.spacing.lg,
    },
    inputContainer: {
      position: 'relative',
      width: '100%',
    },
    input: {
      height: theme.spacing.lg + theme.spacing.xxxl,
      backgroundColor: theme.colors.background.primary,
      borderColor: theme.colors.border,
      borderWidth: theme.borderWidth.thin,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      paddingRight: theme.spacing.xxl + 20,
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.md,
      width: '100%',
    },
    inputFocused: {
      borderColor: theme.colors.text.link,
      borderWidth: theme.borderWidth.medium,
    },
    inputError: {
      borderColor: theme.colors.error,
      borderWidth: theme.borderWidth.thin + 0.5,
    },
    errorText: {
      fontSize: theme.typography.sizes.xs,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
      marginLeft: theme.spacing.sm,
    },
    checkmark: {
      position: 'absolute',
      right: theme.spacing.lg,
      top: '55%',
      marginTop: theme.spacing.md * -1,
      width: theme.spacing.lg + 2,
      height: theme.spacing.lg + 2,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.success,
      justifyContent: 'center',
      alignItems: 'center',
    },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    commaText: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.link,
      marginLeft: theme.spacing.xxs,
    },
    suggestionsWrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    expandedSuggestionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    suggestionText: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.link,
    },
    showMoreButton: {
      marginTop: theme.spacing.xs,
    },
    showMoreText: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.link,
    },
  });

export default UserNameScreen;
