import CustomBottomSheet from '@/src/components/CustomBottomSheet';
import EmailIcon from '@/src/components/icons/EmailIcon';
import GlobeIcon from '@/src/components/icons/GlobeIcon';
import VerifiedIcon from '@/src/components/icons/VerifiedIcon';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Check } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AccountCheckIcon from '../../../components/icons/AccountCheckIcon';

interface IReplyRestrictionModalProps {
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
  selectedOption: number;
  onSelect: (option: number) => void;
}

const ReplyRestrictionModal: React.FC<IReplyRestrictionModalProps> = (props) => {
  const { bottomSheetRef, selectedOption, onSelect } = props;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  const handleSelect = (option: number) => {
    onSelect(option);
    bottomSheetRef.current?.dismiss();
  };
  const options = useMemo(
    () => [
      { label: t('tweets.replyRestriction.options.everyone'), icon: GlobeIcon },
      { label: t('tweets.replyRestriction.options.verifiedAccounts'), icon: VerifiedIcon },
      { label: t('tweets.replyRestriction.options.accountsYouFollow'), icon: AccountCheckIcon },
      { label: t('tweets.replyRestriction.options.onlyAccountsYouMention'), icon: EmailIcon },
    ],
    [t],
  );

  return (
    <CustomBottomSheet bottomSheetModalRef={bottomSheetRef}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('tweets.replyRestriction.title')}</Text>
        <Text style={styles.subtitle}>{t('tweets.replyRestriction.subtitle')}</Text>

        <View style={styles.optionsContainer}>
          {options.map((option, index) => {
            const Icon = option.icon;
            return (
              <Pressable
                key={option.label}
                style={styles.option}
                onPress={() => handleSelect(index)}
                accessibilityLabel={`reply_restriction_option_${index}`}
                testID={`reply_restriction_option_${index}`}
              >
                <View style={styles.optionLeft}>
                  <View style={styles.iconWrapper}>
                    <View style={styles.iconContainer}>
                      <Icon size={20} stroke={theme.colors.white} strokeWidth={0} filled={false} />
                    </View>
                    {selectedOption === index && (
                      <View style={styles.checkmarkContainer}>
                        <Check size={theme.iconSizesAlt.xs} color={theme.colors.white} strokeWidth={4} />
                      </View>
                    )}
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </CustomBottomSheet>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    title: {
      fontSize: theme.typography.sizes.xml,
      fontFamily: theme.typography.fonts.extraBold,
      color: theme.colors.text.primary,
      textAlign: 'left',
    },
    subtitle: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xl,
      textAlign: 'left',
    },
    optionsContainer: {
      gap: theme.spacing.xs,
      marginTop: theme.spacing.md,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
    },
    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      flex: 1,
    },
    iconWrapper: {
      position: 'relative',
      width: theme.iconSizes.iconExtraLarge,
      height: theme.iconSizes.iconExtraLarge,
    },
    iconContainer: {
      width: theme.iconSizes.iconExtraLarge,
      height: theme.iconSizes.iconExtraLarge,
      borderRadius: theme.iconSizes.iconExtraLarge / 2,
      backgroundColor: theme.colors.accent.bookmark,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkmarkContainer: {
      position: 'absolute',
      bottom: -5,
      right: -5,
      width: theme.iconSizes.lg,
      height: theme.iconSizes.lg,
      borderRadius: theme.iconSizes.lg / 2,
      backgroundColor: theme.colors.success,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: theme.colors.background.primary,
    },
    iconContainerSelected: {
      backgroundColor: theme.colors.accent.bookmark,
    },
    textContainer: {
      flex: 1,
    },
    optionLabel: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xxs,
      textAlign: 'left',
    },
  });

export default ReplyRestrictionModal;
