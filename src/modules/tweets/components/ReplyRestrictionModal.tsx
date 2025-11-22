import CustomBottomSheet from '@/src/components/CustomBottomSheet';
import AccountIcon from '@/src/components/icons/AccountIcon';
import EmailIcon from '@/src/components/icons/EmailIcon';
import GlobeIcon from '@/src/components/icons/GlobeIcon';
import VerifiedIcon from '@/src/components/icons/VerifiedIcon';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Check } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ReplyRestrictionOptions } from '../types';

interface IReplyRestrictionModalProps {
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
  selectedOption: ReplyRestrictionOptions;
  onSelect: (option: ReplyRestrictionOptions) => void;
}

const options = [
  {
    label: 'Everyone',
    icon: GlobeIcon,
  },
  {
    label: 'Verified accounts',
    icon: VerifiedIcon,
  },
  {
    label: 'Accounts you follow',
    icon: AccountIcon,
  },
  {
    label: 'Only accounts you mention',
    icon: EmailIcon,
  },
];

const ReplyRestrictionModal: React.FC<IReplyRestrictionModalProps> = (props) => {
  const { bottomSheetRef, selectedOption, onSelect } = props;
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleSelect = (optionLabel: ReplyRestrictionOptions) => {
    onSelect(optionLabel);
    bottomSheetRef.current?.dismiss();
  };

  return (
    <CustomBottomSheet bottomSheetModalRef={bottomSheetRef}>
      <View style={styles.container}>
        <Text style={styles.title}>Who can reply?</Text>
        <Text style={styles.subtitle}>
          Pick who can reply to this post. Keep in mind that anyone mentioned can always reply.
        </Text>

        <View style={styles.optionsContainer}>
          {options.map((option) => {
            const Icon = option.icon;
            const label = option.label as ReplyRestrictionOptions;

            return (
              <Pressable
                key={option.label}
                style={styles.option}
                onPress={() => handleSelect(label)}
                accessibilityLabel={`reply_restriction_option_${label.toLowerCase().replace(/ /g, '_')}`}
                testID={`reply_restriction_option_${label.toLowerCase().replace(/ /g, '_')}`}
              >
                <View style={styles.optionLeft}>
                  <View style={styles.iconWrapper}>
                    <View style={styles.iconContainer}>
                      <Icon size={20} stroke={theme.colors.white} strokeWidth={0} filled={false} />
                    </View>
                    {selectedOption === label && (
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
    },
    subtitle: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xl,
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
    },
  });

export default ReplyRestrictionModal;
