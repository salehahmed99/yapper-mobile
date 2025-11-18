import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { ISvgIconProps } from '@/src/types/svg';
import { formatCount } from '@/src/utils/formatCount';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface ITweetActionButtonProps {
  icon: React.FC<ISvgIconProps>;
  count?: number;
  onPress: () => void;
  strokeColor: string;
  fillColor?: string;
  accessibilityLabel: string;
  size: 'small' | 'large';
  isRepost?: boolean;
}
const TweetActionButton: React.FC<ITweetActionButtonProps> = (props) => {
  const { icon: Icon, count, onPress, strokeColor, fillColor, accessibilityLabel, size, isRepost = false } = props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const additonalSize = isRepost ? 2 : 0;
  return (
    <Pressable style={styles.actionItem} onPress={onPress} hitSlop={15} accessibilityLabel={accessibilityLabel}>
      <Icon
        size={size === 'small' ? theme.iconSizes.xs + additonalSize : theme.iconSizes.iconSmall + additonalSize}
        stroke={strokeColor}
        strokeWidth={9}
        fill={fillColor || 'transparent'}
      />
      {count ? (
        <Text style={[styles.actionCount, strokeColor && { color: strokeColor }]}>{formatCount(count)}</Text>
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
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fonts.regular,
      fontSize: theme.typography.sizes.xs,
    },
  });
