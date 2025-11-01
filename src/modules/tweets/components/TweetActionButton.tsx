import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { formatCount } from '@/src/utils/formatCount';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SvgProps } from 'react-native-svg';

interface ITweetActionButtonProps {
  icon: React.FC<SvgProps>;
  count?: number;
  onPress: () => void;
  strokeColor?: string;
  fillColor?: string;
  accessibilityLabel: string;
}
const TweetActionButton: React.FC<ITweetActionButtonProps> = (props) => {
  const { icon: Icon, count, onPress, strokeColor, fillColor, accessibilityLabel } = props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <Pressable style={styles.actionItem} onPress={onPress} hitSlop={15} accessibilityLabel={accessibilityLabel}>
      <Icon
        width={theme.iconSizes.xs}
        height={theme.iconSizes.xs}
        color={strokeColor || theme.colors.text.secondary}
        strokeWidth={10}
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
