import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/context/ThemeContext';
import { Theme } from '@/src/constants/theme';

interface ISettingsTopBarProps {
  title: string;
  subtitle?: string;
  onBackPress: () => void;
  showBackButton?: boolean;
}

export const SettingsTopBar: React.FC<ISettingsTopBarProps> = ({
  title,
  subtitle,
  onBackPress,
  showBackButton = true,
}) => {
  const { i18n } = useTranslation();
  const { theme } = useTheme();

  // Check if the current language is RTL
  const isRTL = i18n.language === 'ar';
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            accessibilityLabel="Go_back"
            testID="Go_back"
          >
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} style={styles.icon} />
          </TouchableOpacity>
        )}
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.background.primary,
      borderBottomWidth: theme.borderWidth.thin,
      borderBottomColor: theme.colors.border,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      marginRight: theme.spacing.lg,
      padding: theme.spacing.xs,
    },
    headerTextContainer: {
      flex: 1,
    },
    headerTitle: {
      fontSize: theme.typography.sizes.lg,
      fontFamily: theme.typography.fonts.medium,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xxs,
    },
    headerSubtitle: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
    },
    icon: {
      fontSize: 24,
      color: theme.colors.text.primary,
      paddingRight: theme.spacing.sm,
    },
  });
