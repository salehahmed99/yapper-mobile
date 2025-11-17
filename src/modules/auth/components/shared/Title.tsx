import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';

interface AuthTitleProps {
  title: string;
}

const AuthTitle: React.FC<AuthTitleProps> = ({ title }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return <Text style={styles.title}>{title}</Text>;
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    title: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.xml,
      fontFamily: theme.typography.fonts.bold,
      lineHeight: 36,
      marginBottom: theme.spacing.mdg,
      letterSpacing: -0.3,
      paddingHorizontal: theme.spacing.md,
    },
  });

export default AuthTitle;
