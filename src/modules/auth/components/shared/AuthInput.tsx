import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { AlertCircle, Check } from 'lucide-react-native';

interface IAuthInputProps {
  description: string;
  label: string;
  value: string; // ISO format for backend
  status?: 'success' | 'error' | 'none';
  showCheck?: boolean;
  showDescription?: boolean;
  errorMessage?: string;
  onChange: (text: string) => void;
  type?: 'text' | 'date';
}

const AuthInput: React.FC<IAuthInputProps> = ({
  description,
  label,
  value,
  status = 'none',
  showCheck = false,
  showDescription = false,
  errorMessage,
  onChange,
  type = 'text',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [displayDate, setDisplayDate] = useState<string>('');

  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();

  const scaleWidth = Math.min(Math.max(width / 390, 0.85), 1.1);
  const scaleHeight = Math.min(Math.max(height / 844, 0.85), 1.1);
  const scaleFonts = Math.min(scaleWidth, scaleHeight);

  const styles = useMemo(
    () => createStyles(theme, scaleWidth, scaleHeight, scaleFonts),
    [theme, scaleWidth, scaleHeight, scaleFonts],
  );

  const labelPosition = useRef(new Animated.Value(value ? 1 : 0)).current;
  const shouldFloat = isFocused || value.length > 0;

  useEffect(() => {
    Animated.timing(labelPosition, {
      toValue: shouldFloat ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [shouldFloat, labelPosition]);

  // Update displayDate if value changes externally
  useEffect(() => {
    if (value) {
      const dateObj = new Date(value);
      if (!isNaN(dateObj.getTime())) {
        setDisplayDate(format(dateObj, 'MMMM dd, yyyy')); // Human-readable
      }
    } else {
      setDisplayDate('');
    }
  }, [value]);

  const labelStyle = {
    position: 'absolute' as const,
    left: theme.spacing.lg,
    top: labelPosition.interpolate({ inputRange: [0, 1], outputRange: [18, -10] }),
    fontSize: labelPosition.interpolate({ inputRange: [0, 1], outputRange: [17, 13] }),
    color: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [
        theme.colors.text.secondary,
        status === 'error' ? theme.colors.error : isFocused ? theme.colors.text.link : theme.colors.text.secondary,
      ],
    }),
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: theme.spacing.xs,
    zIndex: 1,
  };

  const onDateConfirm = (selectedDate: Date) => {
    setShowPicker(false);
    // Backend ISO format
    onChange(selectedDate.toISOString().split('T')[0]);
    // Display human-readable
    setDisplayDate(format(selectedDate, 'MMMM dd, yyyy'));
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Animated.Text style={labelStyle}>{label}</Animated.Text>

        {type === 'date' ? (
          <>
            <Pressable
              onPress={() => setShowPicker(true)}
              style={[styles.input, isFocused && styles.inputFocused, status === 'error' && styles.inputError]}
            >
              <Text style={displayDate ? styles.dateTextFilled : styles.dateTextPlaceholder}>
                {displayDate || label}
              </Text>
            </Pressable>

            <DateTimePickerModal
              isVisible={showPicker}
              mode="date"
              date={value ? new Date(value) : new Date()}
              onConfirm={onDateConfirm}
              onCancel={() => setShowPicker(false)}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)} // Prevent weird 1970 fallback
            />
          </>
        ) : (
          <TextInput
            style={[styles.input, isFocused && styles.inputFocused, status === 'error' && styles.inputError]}
            value={value}
            onChangeText={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardAppearance="dark"
          />
        )}

        {showDescription && <Text style={styles.description}>{description}</Text>}

        {showCheck && status === 'success' && value.length > 0 && (
          <View style={styles.successIcon}>
            <Check color={theme.colors.text.inverse} size={14 * scaleFonts} />
          </View>
        )}

        {showCheck && status === 'error' && value.length > 0 && (
          <View style={styles.errorIconContainer}>
            <AlertCircle color={theme.colors.error} size={24 * scaleFonts} />
          </View>
        )}
      </View>

      {status === 'error' && errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

export default AuthInput;

const createStyles = (theme: Theme, scaleWidth = 1, scaleHeight = 1, scaleFonts = 1) =>
  StyleSheet.create({
    container: {
      width: '100%',
      paddingHorizontal: theme.spacing.mdg * scaleWidth,
      paddingTop: theme.spacing.lg * scaleHeight,
    },
    description: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.sm * scaleFonts,
      fontFamily: theme.typography.fonts.regular,
      lineHeight: 20 * scaleHeight,
      marginTop: theme.spacing.sm * scaleHeight,
    },
    inputContainer: {
      position: 'relative',
      width: '100%',
    },
    input: {
      height: 56 * scaleHeight,
      backgroundColor: theme.colors.background.primary,
      borderColor: theme.colors.border,
      borderWidth: theme.borderWidth.thin,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.lg * scaleWidth,
      paddingVertical: theme.spacing.lg * scaleHeight,
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.md * scaleFonts,
      justifyContent: 'center',
    },
    inputFocused: {
      borderColor: theme.colors.text.link,
      borderWidth: theme.borderWidth.medium,
    },
    inputError: {
      borderColor: theme.colors.error,
      borderWidth: theme.borderWidth.medium,
    },
    dateTextFilled: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.md * scaleFonts,
    },
    dateTextPlaceholder: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.md * scaleFonts,
      fontFamily: theme.typography.fonts.regular,
    },
    successIcon: {
      position: 'absolute',
      right: theme.spacing.md * scaleWidth,
      top: theme.spacing.lg * scaleHeight,
      width: 20 * scaleWidth,
      height: 20 * scaleHeight,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.success,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorIconContainer: {
      position: 'absolute',
      right: theme.spacing.md * scaleWidth,
      top: theme.spacing.md * scaleHeight,
      paddingHorizontal: theme.spacing.xs * scaleWidth,
      paddingVertical: theme.spacing.xs * scaleHeight,
    },
    errorText: {
      fontSize: theme.typography.sizes.xs * scaleFonts,
      color: theme.colors.error,
      marginTop: theme.spacing.xs * scaleHeight,
    },
  });
