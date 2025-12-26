import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useMuteUser } from '@/src/modules/profile/hooks/useMuteUser';
import { IUser } from '@/src/types/user';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface IMuteButtonProps {
  user: IUser;
  onPress?: (user: IUser) => void;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    muteButton: {
      backgroundColor: theme.colors.warning, // filled by default (Mute)
      borderWidth: theme.borderWidth.thin,
      borderColor: theme.colors.warning,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.borderRadius.full,
      width: theme.spacing.xxl * 4.5,
      height: theme.buttonHeights.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    mutedButton: {
      backgroundColor: 'transparent', // outlined when Unmute
      borderWidth: theme.borderWidth.thin,
      borderColor: theme.colors.warning,
    },
    muteButtonText: {
      color: theme.colors.text.inverse, // white text for filled
      fontSize: theme.typography.sizes.sm - 1,
      fontFamily: theme.typography.fonts.bold,
      lineHeight: theme.typography.sizes.sm * theme.typography.lineHeights.tight,
    },
    mutedButtonText: {
      color: theme.colors.warning, // orange text for outlined
      fontFamily: theme.typography.fonts.bold,
    },
  });

const MuteButton: React.FC<IMuteButtonProps> = ({ user, onPress }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Use the mute hook
  const { isMuted, toggleMute, setIsMuted } = useMuteUser(user.isMuted || false);

  // Sync with user prop changes
  useEffect(() => {
    setIsMuted(user.isMuted || false);
  }, [user.isMuted, setIsMuted]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePress = async (e: any) => {
    e?.stopPropagation?.();

    // Toggle mute status
    await toggleMute(user.id);

    // Call optional onPress callback
    if (onPress) {
      onPress({ ...user, isMuted: !isMuted });
    }
  };

  const isUnmute = isMuted;
  return (
    <TouchableOpacity
      style={[styles.muteButton, isUnmute && styles.mutedButton]}
      onPress={handlePress}
      activeOpacity={0.7}
      testID={`mute_button_${user.id}`}
      accessibilityLabel={isUnmute ? `unmute_${user.username || user.name}` : `mute_${user.username || user.name}`}
      accessibilityRole="button"
    >
      <Text style={[styles.muteButtonText, isUnmute && styles.mutedButtonText]} testID={`mute_button_text_${user.id}`}>
        {isUnmute ? t('userList.unmute') : t('userList.mute')}
      </Text>
    </TouchableOpacity>
  );
};

export default MuteButton;
