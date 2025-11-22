import AccountIcon from '@/src/components/icons/AccountIcon';
import EmailIcon from '@/src/components/icons/EmailIcon';
import GlobeIcon from '@/src/components/icons/GlobeIcon';
import VerifiedIcon from '@/src/components/icons/VerifiedIcon';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { ISvgIconProps } from '@/src/types/svg';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ReplyRestrictionOptions } from '../types';

interface IReplyRestrictionSelectorProps {
  onPress: () => void;
  selectedOption: ReplyRestrictionOptions;
}

const ReplyRestrictionSelector: React.FC<IReplyRestrictionSelectorProps> = (props) => {
  const { onPress, selectedOption } = props;
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const Icon: React.FC<ISvgIconProps> = useMemo(() => {
    switch (selectedOption) {
      case 'Everyone':
        return GlobeIcon;
      case 'Verified accounts':
        return VerifiedIcon;
      case 'Accounts you follow':
        return AccountIcon;
      case 'Only accounts you mention':
        return EmailIcon;
      default:
        return GlobeIcon;
    }
  }, [selectedOption]);

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={onPress}
        accessibilityLabel="create_post_reply_restriction_selector"
        testID="create_post_reply_restriction_selector"
      >
        <Icon size={16} stroke={theme.colors.accent.bookmark} strokeWidth={0} filled={true} />
        <Text style={styles.text}>{selectedOption} can reply</Text>
      </Pressable>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    text: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.accent.bookmark,
      fontFamily: theme.typography.fonts.semiBold,
    },
    buttonPressed: {
      opacity: 0.5,
    },
  });

export default ReplyRestrictionSelector;
