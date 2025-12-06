import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useBlockUser } from '@/src/modules/profile/hooks/useBlockUser';
import { IUser } from '@/src/types/user';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface IBlockButtonProps {
  user: IUser;
  onPress?: (user: IUser) => void;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    blockButton: {
      backgroundColor: theme.colors.error, // filled by default (Block)
      borderWidth: theme.borderWidth.thin,
      borderColor: theme.colors.error,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.borderRadius.full,
      width: theme.spacing.xxl * 4.5,
      height: theme.buttonHeights.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    blockedButton: {
      backgroundColor: 'transparent', // outlined when Unblock
      borderWidth: theme.borderWidth.thin,
      borderColor: theme.colors.error,
    },
    blockButtonText: {
      color: theme.colors.text.inverse, // white text for filled
      fontSize: theme.typography.sizes.sm - 1,
      fontFamily: theme.typography.fonts.bold,
      lineHeight: theme.typography.sizes.sm * theme.typography.lineHeights.tight,
    },
    blockedButtonText: {
      color: theme.colors.error, // red text for outlined
      fontFamily: theme.typography.fonts.bold,
    },
  });

const BlockButton: React.FC<IBlockButtonProps> = ({ user, onPress }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Use the block hook
  const { isBlocked, isLoading, toggleBlock, setIsBlocked } = useBlockUser(user.isBlocked || false);

  // Sync with user prop changes
  useEffect(() => {
    setIsBlocked(user.isBlocked || false);
  }, [user.isBlocked, setIsBlocked]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePress = async (e: any) => {
    e?.stopPropagation?.();

    // Toggle block status
    await toggleBlock(user.id);

    // Call optional onPress callback
    if (onPress) {
      onPress({ ...user, isBlocked: !isBlocked });
    }
  };

  const isUnblock = isBlocked;
  return (
    <TouchableOpacity
      style={[styles.blockButton, isUnblock && styles.blockedButton]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={isLoading}
      testID={`block_button_${user.id}`}
      accessibilityLabel={isUnblock ? `unblock_${user.username || user.name}` : `block_${user.username || user.name}`}
      accessibilityRole="button"
      accessibilityState={{ disabled: isLoading }}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={theme.colors.error} testID={`block_button_loader_${user.id}`} />
      ) : (
        <Text
          style={[styles.blockButtonText, isUnblock && styles.blockedButtonText]}
          testID={`block_button_text_${user.id}`}
        >
          {isUnblock ? t('userList.unblock') : t('userList.block')}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default BlockButton;
