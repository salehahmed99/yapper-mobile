import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  style?: any;
}

export default function FloatingActionButton({ onPress, icon, style }: FloatingActionButtonProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity
      style={[styles.fab, style]}
      onPress={onPress}
      activeOpacity={0.8}
      testID="floating_action_button"
      accessibilityRole="button"
      accessibilityLabel="Floating action button"
    >
      {icon}
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    fab: {
      position: 'absolute',
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.accent.bookmark,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
    },
  });
