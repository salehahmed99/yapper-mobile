import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';

interface IAuthInputProps {
  title: string;
  description: string;
  label: string;
  value: string;
  onChange: (text: string) => void;
  type?: 'text' | 'date';
}

const AuthInput: React.FC<IAuthInputProps> = ({ title, description, label, value, onChange, type = 'text' }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const labelPosition = useRef(new Animated.Value(value ? 1 : 0)).current;

  const shouldFloat = isFocused || value.length > 0;

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

  const onDateConfirm = (selectedDate: Date) => {
    setShowPicker(false);
    const formatted = selectedDate.toISOString().split('T')[0];
    onChange(formatted);
  };

  const onDateCancel = () => {
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.inputContainer}>
        <Animated.Text style={labelStyle}>{label}</Animated.Text>

        {type === 'date' ? (
          <>
            <Pressable
              onPress={() => setShowPicker(true)}
              style={[styles.input, isFocused && styles.inputFocused, styles.dateInput]}
              accessibilityLabel="Auth_date_input"
            >
              <Text style={value ? styles.dateTextFilled : styles.dateTextPlaceholder}>{value || label}</Text>
            </Pressable>
            <DateTimePickerModal
              isVisible={showPicker}
              mode="date"
              date={value ? new Date(value) : new Date()}
              onConfirm={onDateConfirm}
              onCancel={onDateCancel}
              maximumDate={new Date()}
            />
          </>
        ) : (
          <TextInput
            style={[styles.input, isFocused && styles.inputFocused]}
            value={value}
            onChangeText={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardAppearance="dark"
            accessibilityLabel="Auth_text_input"
          />
        )}
      </View>
    </View>
  );
};

export default AuthInput;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
      paddingHorizontal: theme.spacing.mdg,
      paddingTop: theme.spacing.lg,
    },
    title: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.xml,
      fontFamily: theme.typography.fonts.bold,
      lineHeight: 36,
      marginBottom: theme.spacing.mdg,
      letterSpacing: -0.3,
    },
    description: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      lineHeight: 20,
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
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.md,
      width: '100%',
      justifyContent: 'center',
    },
    inputFocused: {
      borderColor: theme.colors.text.link,
      borderWidth: theme.borderWidth.medium,
    },
    dateInput: {
      justifyContent: 'center',
    },
    dateTextFilled: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.md,
    },
    dateTextPlaceholder: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.regular,
    },
  });
