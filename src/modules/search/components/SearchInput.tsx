import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import React, { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';

interface ISearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onFocus?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
}

const SearchInput: React.FC<ISearchInputProps> = ({
  value,
  onChangeText,
  onSubmit,
  onFocus,
  autoFocus = true,
  placeholder,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus) {
      // Delay focus to ensure the component is mounted
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleFocus = () => {
    if (onFocus) {
      onFocus();
    }
  };

  const handleSubmitEditing = () => {
    if (onSubmit && value.trim().length > 0) {
      onSubmit();
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={handleSubmitEditing}
        onFocus={handleFocus}
        placeholder={placeholder || t('search.placeholder', 'Search')}
        placeholderTextColor={theme.colors.text.secondary}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        testID="search_text_input"
      />
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    input: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.regular,
      paddingVertical: theme.spacing.sm,
    },
  });

export default SearchInput;
