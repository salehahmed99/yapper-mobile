import { StyleSheet } from 'react-native';
import { Theme } from '../../../constants/theme';

export const createContainerStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      // flexGrow: 1,
      // paddingBottom: 100,
    },
    tabsContainer: {
      flex: 99999999,
    },
  });

export default createContainerStyles;
