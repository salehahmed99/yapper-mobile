import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';

interface InputField {
  label: string;
  value: string;
  onChange: (text: string) => void;
  type?: 'text' | 'date' | 'password';
  hint?: string; // 👈 new optional hint text
}

interface IMultiAuthInputsProps {
  fields: InputField[];
}

const MultiAuthInputs: React.FC<IMultiAuthInputsProps> = ({ fields }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {fields.map((field, index) => (
        <FloatingInput key={index} {...field} theme={theme} styles={styles} />
      ))}
    </View>
  );
};

interface FloatingInputProps extends InputField {
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  hint,
  theme,
  styles,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showPassword] = useState(false);
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

  return (
    <View style={styles.inputWrapper}>
      <View style={styles.inputContainer}>
        <Animated.Text style={labelStyle}>{label}</Animated.Text>

        {type === 'date' ? (
          <>
            <Pressable
              onPress={() => setShowPicker(true)}
              onPressIn={() => setIsFocused(true)}
              onPressOut={() => setIsFocused(false)}
              style={[styles.input, isFocused && styles.inputFocused]}
            >
              <Text style={value ? styles.dateTextFilled : styles.dateTextPlaceholder}>{value || label}</Text>
            </Pressable>

            <DateTimePickerModal
              isVisible={showPicker}
              mode="date"
              date={value ? new Date(value) : new Date()}
              onConfirm={onDateConfirm}
              onCancel={() => setShowPicker(false)}
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
            secureTextEntry={type === 'password' && !showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardAppearance="dark"
          />
        )}
      </View>

      {isFocused && hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

export default MultiAuthInputs;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      gap: theme.spacing.lg,
      backgroundColor: theme.colors.background.primary,
      paddingHorizontal: theme.spacing.mdg,
      paddingTop: theme.spacing.lg,
    },
    inputWrapper: {
      width: '100%',
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
    dateTextFilled: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.md,
    },
    dateTextPlaceholder: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.md,
    },
    hint: {
      marginTop: 4,
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.xs,
      fontFamily: theme.typography.fonts.regular,
    },
  });
