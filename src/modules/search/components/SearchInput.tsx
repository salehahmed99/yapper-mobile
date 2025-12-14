import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import { ArrowLeft, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ISearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  onFocus?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
}

const SearchInput: React.FC<ISearchInputProps> = ({
  value,
  onChangeText,
  onSubmit,
  onClear,
  onFocus,
  autoFocus = true,
  placeholder,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { goBack } = useNavigation();
  const insets = useSafeAreaInsets();
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

  const handleBack = () => {
    goBack();
  };

  const handleClear = () => {
    onChangeText('');
    if (onClear) {
      onClear();
    } else {
      inputRef.current?.focus();
    }
  };

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
    <View style={[styles.container, { paddingTop: insets.top + theme.spacing.sm }]}>
      {/* Back Arrow */}
      <Pressable
        onPress={handleBack}
        accessibilityLabel={t('accessibility.goBack')}
        accessibilityRole="button"
        style={styles.backButton}
        testID="search_back_button"
      >
        <ArrowLeft size={24} color={theme.colors.text.primary} />
      </Pressable>

      {/* Text Input */}
      <View style={styles.inputContainer}>
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

      {/* Clear Button */}
      {value.length > 0 && (
        <Pressable
          onPress={handleClear}
          accessibilityLabel={t('search.clear', 'Clear')}
          accessibilityRole="button"
          style={styles.clearButton}
          testID="search_clear_button"
        >
          <X size={20} color={theme.colors.text.secondary} />
        </Pressable>
      )}
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      backgroundColor: theme.colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: theme.spacing.sm,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputContainer: {
      flex: 1,
    },
    input: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.regular,
      paddingVertical: theme.spacing.sm,
    },
    clearButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default SearchInput;
