import AccountCheckIcon from '@/src/components/icons/AccountCheckIcon';
import EmailIcon from '@/src/components/icons/EmailIcon';
import GlobeIcon from '@/src/components/icons/GlobeIcon';
import VerifiedIcon from '@/src/components/icons/VerifiedIcon';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface IReplyRestrictionSelectorProps {
  onPress: () => void;
  selectedOption: number;
}

const ReplyRestrictionSelector: React.FC<IReplyRestrictionSelectorProps> = (props) => {
  const { onPress, selectedOption } = props;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  const options = useMemo(
    () => [
      { label: t('tweets.replyRestriction.options.everyone'), icon: GlobeIcon },
      { label: t('tweets.replyRestriction.options.verifiedAccounts'), icon: VerifiedIcon },
      { label: t('tweets.replyRestriction.options.accountsYouFollow'), icon: AccountCheckIcon },
      { label: t('tweets.replyRestriction.options.onlyAccountsYouMention'), icon: EmailIcon },
    ],
    [t],
  );

  const Icon = options[selectedOption].icon;

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={onPress}
        accessibilityLabel="create_post_reply_restriction_selector"
        testID="create_post_reply_restriction_selector"
      >
        <Icon size={16} stroke={theme.colors.accent.bookmark} strokeWidth={0} filled={true} />
        <Text style={styles.text}>
          {t('tweets.replyRestriction.canReply', { selection: options[selectedOption].label })}
        </Text>
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
