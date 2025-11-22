import CustomBottomSheet from '@/src/components/CustomBottomSheet';
import QuoteIcon from '@/src/components/icons/QuoteIcon';
import RepostIcon from '@/src/components/icons/RepostIcon';
import ViewsIcon from '@/src/components/icons/ViewsIcon';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { ISvgIconProps } from '@/src/types/svg';
import { BottomSheetModal, useBottomSheet } from '@gorhom/bottom-sheet';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface IRepostOptionsItemProps {
  icon: React.FC<ISvgIconProps>;
  text: string;
  onPress: () => void;
  color?: string;
  testID?: string;
  accessibilityLabel?: string;
}
const RepostOptionsItem: React.FC<IRepostOptionsItemProps> = (props) => {
  const { icon: Icon, text, onPress, color, testID, accessibilityLabel } = props;
  const { theme } = useTheme();
  const styles = createRepostOptionsItemStyles(theme);

  const { close } = useBottomSheet();

  const handlePress = () => {
    onPress();
    close();
  };

  return (
    <Pressable style={styles.container} onPress={handlePress} testID={testID} accessibilityLabel={accessibilityLabel}>
      <Icon size={theme.iconSizesAlt.xl} stroke={color || theme.colors.text.secondary} strokeWidth={0.3} />
      <Text style={[styles.text, { color: color || theme.colors.text.primary }]}>{text}</Text>
    </Pressable>
  );
};

const createRepostOptionsItemStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.lg,
    },
    text: {
      fontFamily: theme.typography.fonts.semiBold,
      fontSize: theme.typography.sizes.sm,
    },
  });

interface IRepostOptionsModalProps {
  isReposted: boolean;
  onRepostPress: () => void;
  onQuotePress: () => void;
  onViewInteractionsPress: () => void;
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
}
const RepostOptionsModal: React.FC<IRepostOptionsModalProps> = (props) => {
  const { onRepostPress, onQuotePress, onViewInteractionsPress, isReposted, bottomSheetModalRef } = props;
  const { theme } = useTheme();
  const styles = createRepostOptionsModalStyles(theme);
  return (
    <CustomBottomSheet bottomSheetModalRef={bottomSheetModalRef}>
      <View style={styles.bottomSheetContainer}>
        <RepostOptionsItem
          icon={RepostIcon}
          text={isReposted ? 'Undo repost' : 'Repost'}
          onPress={onRepostPress}
          color={isReposted ? theme.colors.error : undefined}
          testID="repost_option_repost"
          accessibilityLabel="repost_option_repost"
        />
        <RepostOptionsItem
          icon={QuoteIcon}
          text="Quote"
          onPress={onQuotePress}
          testID="repost_option_quote"
          accessibilityLabel="repost_option_quote"
        />
        <RepostOptionsItem
          icon={ViewsIcon}
          text="View Post Interactions"
          onPress={onViewInteractionsPress}
          testID="repost_option_view_interactions"
          accessibilityLabel="repost_option_view_interactions"
        />
      </View>
    </CustomBottomSheet>
  );
};

const createRepostOptionsModalStyles = (theme: Theme) =>
  StyleSheet.create({
    bottomSheetContainer: {
      gap: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
    },
  });

export default RepostOptionsModal;
