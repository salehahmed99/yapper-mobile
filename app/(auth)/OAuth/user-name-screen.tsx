import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Animated, TextInput } from 'react-native';
import { useTheme } from '../../../src/context/ThemeContext';
import { Theme } from '../../../src/constants/theme';
import { useTranslation } from 'react-i18next';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import { Check } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';
import { updateUserName } from '@/src/services/userService';
import Toast from 'react-native-toast-message';
import ActivityLoader from '@/src/components/ActivityLoader';
import { useAuthStore } from '@/src/store/useAuthStore';

const UserNameScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { sessionToken: _sessionToken, userNames: userNamesParam } = useLocalSearchParams();

  // Parse userNames from params
  const availableUsernames = useMemo(() => {
    if (Array.isArray(userNamesParam)) return userNamesParam;
    if (typeof userNamesParam === 'string') {
      try {
        return JSON.parse(userNamesParam);
      } catch {
        return [userNamesParam];
      }
    }
    return [];
  }, [userNamesParam]);

  const [username, setUsername] = useState(availableUsernames[0] || '');
  const [isFocused, setIsFocused] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [, setSelectedUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const labelPosition = useState(new Animated.Value(1))[0];

  const styles = useMemo(() => createStyles(theme), [theme]);
  const setSkipRedirect = useAuthStore((state) => state.setSkipRedirect);

  const shouldFloat = isFocused || username.length > 0;

  React.useEffect(() => {
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
    setSelectedUsername(selectedUsername);
    setUsername(selectedUsername.replace('@', ''));
  };

  const handleNext = async () => {
    setLoading(true);
    if (!username) {
      Toast.show({
        type: 'error',
        text1: t('auth.username.error'),
        text2: 'Please select a username',
      });
      return;
    }

    try {
      await updateUserName(username);
      setSkipRedirect(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('auth.username.errorToast'),
        text2: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    setSkipRedirect(false);
    setLoading(false);
  };

  const isValidUsername = username.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ActivityLoader visible={loading} />
      <TopBar showExitButton={false} />
      <View style={styles.scrollableContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('auth.username.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.username.subtitle')}</Text>
        </View>

        <View style={styles.inputWrapper}>
          <Animated.Text style={labelStyle}>{t('auth.username.label')}</Animated.Text>
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
            />
            {isValidUsername && username.length >= 3 && (
              <View style={styles.checkmark}>
                <Check size={16} color="#FFFFFF" strokeWidth={3} />
              </View>
            )}
          </View>
          {username.length > 0 && username.length < 3 && (
            <Text style={styles.errorText}>{t('auth.username.minLengthError')}</Text>
          )}
        </View>

        <View style={showMore ? styles.expandedSuggestionsContainer : styles.suggestionsWrapper}>
          {availableUsernames
            .slice(0, showMore ? availableUsernames.length : 2)
            .map((item: string, index: number, array: string[]) => (
              <View key={`${item}-${index}`} style={styles.suggestionItem}>
                <TouchableOpacity onPress={() => handleSelectUsername(item)}>
                  <Text style={[styles.suggestionText]}>{item}</Text>
                </TouchableOpacity>

                {index < array.length - 1 && <Text style={styles.commaText}>, </Text>}
              </View>
            ))}
        </View>

        <TouchableOpacity style={styles.showMoreButton} onPress={handleShowMore}>
          <Text style={styles.showMoreText}>
            {showMore ? t('auth.username.showLess') : t('auth.username.showMore')}
          </Text>
        </TouchableOpacity>
      </View>

      <BottomBar
        rightButton={{
          label: t('auth.username.next'),
          onPress: handleNext,
          enabled: true,
          visible: true,
          type: 'primary',
        }}
        leftButton={{
          label: t('auth.username.skipForNow'),
          onPress: handleSkip,
          enabled: true,
          visible: true,
          type: 'secondary',
        }}
      />
    </SafeAreaView>
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
      height: 56,
      backgroundColor: theme.colors.background.primary,
      borderColor: theme.colors.border,
      borderWidth: 1,
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
      borderWidth: 2,
    },
    inputError: {
      borderColor: theme.colors.error,
      borderWidth: 1.5,
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
      marginTop: -12,
      width: 18,
      height: 18,
      borderRadius: 12,
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
      marginLeft: 2,
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
