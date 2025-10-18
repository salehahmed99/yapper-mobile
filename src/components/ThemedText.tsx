import { useMemo } from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { Theme } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'subtitle' | 'body' | 'bodyMedium' | 'caption' | 'tiny' | 'label';

interface IThemedTextProps extends TextProps {
  variant?: Variant;
  color?: string;
}

const getVariantStyles = (theme: Theme): Record<Variant, TextStyle> => ({
  display: {
    fontSize: theme.typography.sizes.xxl,
    lineHeight: theme.typography.sizes.xxl * 1.2,
    fontFamily: theme.typography.fonts.extraBold,
    color: theme.colors.text.primary,
  },
  h1: {
    fontSize: theme.typography.sizes.xl,
    lineHeight: theme.typography.sizes.xl * 1.2,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
  },
  h2: {
    fontSize: theme.typography.sizes.lg,
    lineHeight: theme.typography.sizes.lg * 1.2,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.text.primary,
  },
  h3: {
    fontSize: theme.typography.sizes.md,
    lineHeight: theme.typography.sizes.md * 1.3,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.text.primary,
  },
  body: {
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.sizes.sm * 1.33,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.text.primary,
  },
  bodyMedium: {
    fontSize: theme.typography.sizes.md,
    lineHeight: theme.typography.sizes.md * 1.3,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.text.primary,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.sizes.sm * 1.33,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.sizes.sm * 1.33,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.text.secondary,
  },
  caption: {
    fontSize: theme.typography.sizes.xs,
    lineHeight: theme.typography.sizes.xs * 1.23,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.text.secondary,
  },
  tiny: {
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.1,
    fontFamily: theme.typography.fonts.light,
    color: theme.colors.text.tertiary,
  },
});
export const ThemedText = ({ variant = 'body', color, style, ...props }: IThemedTextProps) => {
  const { theme } = useTheme();
  const variantStyles = useMemo(() => getVariantStyles(theme), [theme]);
  return <Text style={[variantStyles[variant], color && { color }, style]} {...props} />;
};
