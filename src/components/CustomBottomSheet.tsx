import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface ICustomBottomSheetProps {
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
  children?: React.ReactNode;
}
const CustomBottomSheet: React.FC<ICustomBottomSheetProps> = (props) => {
  const { bottomSheetModalRef, children } = props;

  const { theme } = useTheme();
  const styles = createStyles(theme);

  const insets = useSafeAreaInsets();

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={1}
        pressBehavior="close"
        style={{ backgroundColor: theme.colors.overlay }}
      />
    ),
    [theme],
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.backgroundStyle}
      handleIndicatorStyle={styles.handleIndicator}
      handleStyle={styles.handleContainer}
      enablePanDownToClose={true}
      enableOverDrag={true}
    >
      <BottomSheetView style={{ paddingBottom: insets.bottom }}>{children}</BottomSheetView>
    </BottomSheetModal>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    backgroundStyle: {
      backgroundColor: theme.colors.background.primary,
    },
    handleContainer: {
      backgroundColor: theme.colors.background.primary,
      borderTopLeftRadius: theme.borderRadius.full,
      borderTopRightRadius: theme.borderRadius.full,
    },
    handleIndicator: {
      backgroundColor: theme.colors.border,
      width: 40,
      height: 5,
    },
  });

export default CustomBottomSheet;
