import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const useMargins = () => {
  const { theme } = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const marginTop = safeAreaInsets.top + theme.ui.appBarHeight + theme.ui.tabViewHeight;
  const marginBottom = safeAreaInsets.bottom + theme.ui.navHeight;

  return { marginTop, marginBottom };
};

export default useMargins;
