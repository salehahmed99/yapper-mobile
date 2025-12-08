import React, { useRef, useMemo } from 'react';
import {
  TextInput,
  Animated,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  View,
  Text,
  I18nManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { Theme } from '@/src/constants/theme';
import { useTranslation } from 'react-i18next';

interface AnimatedTextInputProps extends TextInputProps {
  onFocusChange?: (isFocused: boolean) => void;
  showPasswordToggle?: boolean;
  isUsername?: boolean;
}

export const AnimatedTextInput: React.FC<AnimatedTextInputProps> = ({
  onFocusChange,
  style,
  showPasswordToggle,
  isUsername,
  ...props
}) => {
  const { theme } = useTheme();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || I18nManager.isRTL;
  const styles = useMemo(() => createStyles(theme, isRTL), [theme, isRTL]);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const animateBorder = (toValue: number) => {
    Animated.timing(borderAnim, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFocus = (e: any) => {
    animateBorder(1);
    onFocusChange?.(true);
    props.onFocus?.(e);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBlur = (e: any) => {
    animateBorder(0);
    onFocusChange?.(false);
    props.onBlur?.(e);
  };

  const getBorderColor = () => {
    return borderAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.border, theme.colors.text.link],
    });
  };

  return (
    <Animated.View style={[styles.animatedView, { borderBottomColor: getBorderColor() }]}>
      <View style={styles.inputWrapper}>
        {isUsername && <Text style={styles.usernamePrefix}>@</Text>}

        <TextInput
          {...props}
          style={[styles.input, showPasswordToggle && styles.inputWithIcon, style]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={showPasswordToggle ? !isPasswordVisible : props.secureTextEntry}
          textAlign={isRTL ? 'left' : 'right'}
        />

        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={theme.colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const createStyles = (theme: Theme, isRTL: boolean) =>
  StyleSheet.create({
    animatedView: {
      borderBottomWidth: 1,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomColor: theme.colors.border,
      borderBottomWidth: 1,
    },

    /* ------- FIXED @ PREFIX ------- */
    usernamePrefix: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text.primary,
    },

    input: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text.primary,
    },
    inputWithIcon: {
      paddingRight: isRTL ? 32 : 0,
      paddingLeft: isRTL ? 0 : 32,
    },
    eyeIcon: {
      position: 'absolute',
      right: isRTL ? 0 : undefined,
      left: isRTL ? undefined : 0,
      padding: 4,
    },
  });
