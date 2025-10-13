// components/Text.tsx
import { StyleSheet, Text, TextProps, TextStyle } from "react-native";
import { theme } from "../constants/theme";

type Variant = "display" | "h1" | "h2" | "h3" | "subtitle" | "body" | "bodyMedium" | "caption" | "tiny" | "label";

export const variantStyles: Record<Variant, TextStyle> = StyleSheet.create({
  display: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fonts.extraBold,
  },
  h1: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fonts.bold,
  },
  h2: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.semiBold,
  },
  h3: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fonts.semiBold,
  },
  body: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.regular,
  },
  bodyMedium: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fonts.medium,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.semiBold,
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.medium,
  },
  caption: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fonts.regular,
  },
  tiny: {
    fontSize: theme.typography.sizes.tiny,
    fontFamily: theme.typography.fonts.light,
  },
});

interface IThemedTextProps extends TextProps {
  variant?: Variant;
  color?: string;
}

export const ThemedText = ({ variant = "body", color, style, ...props }: IThemedTextProps) => {
  return <Text style={[variantStyles[variant], color && { color }, style]} {...props} />;
};
