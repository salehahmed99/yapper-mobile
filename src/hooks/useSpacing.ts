import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const useSpacing = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const top = insets.top + theme.ui.appBarHeight + theme.ui.tabViewHeight;
  const bottom = insets.bottom + theme.ui.navHeight;

  return { top, bottom };
};

export const useSpacingWithoutSafeArea = () => {
  const { theme } = useTheme();

  const top = theme.ui.appBarHeight + theme.ui.tabViewHeight;
  const bottom = theme.ui.navHeight;

  return { top, bottom };
};

// Backwards-compatible aliases for existing imports
export const useMargins = useSpacing;
export const useMarginsWithoutSafeArea = useSpacingWithoutSafeArea;

export default useMargins;
