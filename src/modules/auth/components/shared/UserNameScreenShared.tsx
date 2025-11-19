import React, { useEffect, useMemo, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Theme } from '@/src/constants/theme';
import { usernameSchema } from '@/src/modules/auth/schemas/schemas';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import ActivityLoader from '@/src/components/ActivityLoader';
import Toast from 'react-native-toast-message';

interface IUserNameScreenSharedProps {
  availableUsernames: string[];
  onNext: (username: string) => Promise<void>;
  onSkip: () => void;
  translations: {
    title: string;
    subtitle: string;
    label: string;
    next: string;
    skipForNow: string;
    showMore: string;
    showLess: string;
    minLengthError: string;
    errorToast: string;
    invalidFormatToast: string;
    usernameRequiredTitle: string;
    usernameRequiredMessage: string;
  };
}

const UserNameScreenShared: React.FC<IUserNameScreenSharedProps> = ({
  availableUsernames,
  onNext,
  onSkip,
  translations,
}) => {
  const { theme } = useTheme();

  const [username, setUsername] = useState(availableUsernames[0] || '');
  const [isFocused, setIsFocused] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isNextEnabled, setNextEnabled] = useState(true);
  const labelPosition = useState(new Animated.Value(1))[0];

  const styles = useMemo(() => createStyles(theme), [theme]);

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

  const isUsernameValid = username.length >= 3 && usernameSchema.safeParse(username).success;

  const handleNext = async () => {
    if (!username) {
      Toast.show({
        type: 'error',
        text1: translations.usernameRequiredTitle,
        text2: translations.usernameRequiredMessage,
      });
      return;
    }

    if (!usernameSchema.safeParse(username).success) {
      Toast.show({
        type: 'error',
        text1: translations.errorToast,
        text2: translations.invalidFormatToast,
      });
      return;
    }

    setLoading(true);
    setNextEnabled(false);
    try {
      await onNext(username);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: translations.errorToast,
        text2: (error as Error).message,
      });
    } finally {
      setLoading(false);
      setNextEnabled(true);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    onSkip();
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <ActivityLoader visible={loading} />
      <TopBar showExitButton={false} />
      <View style={styles.scrollableContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{translations.title}</Text>
          <Text style={styles.subtitle}>{translations.subtitle}</Text>
        </View>

        <View style={styles.inputWrapper}>
          <Animated.Text style={labelStyle}>{translations.label}</Animated.Text>
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
            {isUsernameValid && (
              <View style={styles.checkmark}>
                <Check size={16} color="#FFFFFF" strokeWidth={3} />
              </View>
            )}
          </View>
          {username.length > 0 && username.length < 3 && (
            <Text style={styles.errorText}>{translations.minLengthError}</Text>
          )}
        </View>

        <View style={showMore ? styles.expandedSuggestionsContainer : styles.suggestionsWrapper}>
          {availableUsernames
            .slice(0, showMore ? availableUsernames.length : 2)
            .map((item: string, index: number, array: string[]) => (
              <View key={`${item}-${index}`} style={styles.suggestionItem}>
                <TouchableOpacity onPress={() => handleSelectUsername(item)} accessibilityLabel={`suggestion-${item}`}>
                  <Text style={[styles.suggestionText]}>{item}</Text>
                </TouchableOpacity>

                {index < array.length - 1 && <Text style={styles.commaText}>, </Text>}
              </View>
            ))}
        </View>

        {availableUsernames.length > 2 && (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={handleShowMore}
            accessibilityLabel="show-more-button"
          >
            <Text style={styles.showMoreText}>{showMore ? translations.showLess : translations.showMore}</Text>
          </TouchableOpacity>
        )}
      </View>

      <BottomBar
        rightButton={{
          label: translations.next,
          onPress: handleNext,
          enabled: isNextEnabled && isUsernameValid,
          visible: true,
          type: 'primary',
        }}
        leftButton={{
          label: translations.skipForNow,
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
      height: 56,
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
      width: 18,
      height: 18,
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

export default UserNameScreenShared;
