import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';

interface IButtonConfig {
  label: string;
  onPress?: () => void;
  enabled?: boolean;
  visible?: boolean;
  type?: 'primary' | 'secondary';
}

interface IBottomBarProps {
  leftButton?: IButtonConfig;
  rightButton?: IButtonConfig;
}

const BottomBar: React.FC<IBottomBarProps> = ({ leftButton, rightButton }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const renderButton = (button?: IButtonConfig) => {
    if (!button?.visible) return null;

    const isPrimary = button.type === 'primary';
    const isEnabled = button.enabled ?? true;

    return (
      <TouchableOpacity
        onPress={isEnabled ? button.onPress : undefined}
        activeOpacity={0.7}
        disabled={!isEnabled}
        style={[
          styles.buttonBase,
          isPrimary ? styles.primaryButton : styles.secondaryButton,
          !isEnabled && styles.buttonDisabled,
        ]}
        accessibilityLabel="BottomBar_Action_Button"
      >
        <Text
          style={[
            styles.buttonText,
            isPrimary ? styles.primaryText : styles.secondaryText,
            !isEnabled && styles.disabledText,
          ]}
        >
          {button.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const hasLeft = !!leftButton?.visible;
  const hasRight = !!rightButton?.visible;

  return (
    <View style={styles.container}>
      <View style={styles.topBorder} />
      <View style={[styles.content, !hasLeft && hasRight && styles.contentRight]}>
        {renderButton(leftButton)}
        {renderButton(rightButton)}
      </View>
    </View>
  );
};

export default BottomBar;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      backgroundColor: theme.colors.background.primary,
    },
    topBorder: {
      width: '100%',
      height: 1,
      backgroundColor: theme.colors.border,
    },
    content: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    contentRight: {
      justifyContent: 'flex-end',
    },
    buttonBase: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.xxl,
      borderWidth: 1,
    },
    primaryButton: {
      backgroundColor: theme.colors.background.inverse,
    },
    secondaryButton: {
      backgroundColor: theme.colors.background.primary,
      borderColor: theme.colors.text.primary,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.bold,
    },
    primaryText: {
      color: theme.colors.text.inverse,
    },
    secondaryText: {
      color: theme.colors.text.primary,
    },
    disabledText: {
      color: theme.colors.text.tertiary,
    },
  });
