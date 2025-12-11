import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { ISvgIconProps } from '@/src/types/svg';
import { formatCount } from '@/src/utils/formatCount';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface ITweetActionButtonProps {
  icon: React.FC<ISvgIconProps>;
  count?: number;
  onPress?: () => void;
  color?: string;
  filled?: boolean;
  accessibilityLabel: string;
  testID?: string;
  size: 'small' | 'large' | 'modal';
}
const TweetActionButton: React.FC<ITweetActionButtonProps> = (props) => {
  const { icon: Icon, count, onPress, color, filled, accessibilityLabel, testID, size } = props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return theme.iconSizesAlt.xs;
      case 'modal':
        return theme.iconSizesAlt.sm;
      case 'large':
      default:
        return theme.iconSizesAlt.xl;
    }
  };

  return (
    <Pressable
      style={styles.actionItem}
      onPress={onPress}
      hitSlop={15}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <Icon size={getIconSize()} stroke={color || theme.colors.text.secondary} filled={filled} strokeWidth={0} />
      {count ? (
        <Text
          style={[styles.actionCount, { color: color || theme.colors.text.secondary }]}
          accessibilityLabel={`${accessibilityLabel}_count`}
          testID={`${testID}_count`}
        >
          {formatCount(count)}
        </Text>
      ) : null}
    </Pressable>
  );
};

export default TweetActionButton;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    actionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    actionCount: {
      fontFamily: theme.typography.fonts.regular,
      fontSize: theme.typography.sizes.xs,
    },
  });
