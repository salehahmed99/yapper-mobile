import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { borderRadius, colors, opacity, spacing, typography } from '../../../constants/theme';

type Props = {
  onPress?: () => void;
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const ActionButton: React.FC<Props> = ({ onPress, title, style, textStyle }) => {
  return (
    <TouchableOpacity style={[styles.btn, style]} onPress={onPress}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default ActionButton;
const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: `rgba(0,0,0,${opacity.actionButtonBackground})`,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.light.background.primary,
    fontWeight: typography.weights.bold,
  },
});
