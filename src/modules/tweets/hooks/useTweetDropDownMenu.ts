import { useTheme } from '@/src/context/ThemeContext';
import { useRef, useState } from 'react';
import { View } from 'react-native';

const useTweetDropDownMenu = () => {
  const { theme } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const moreButtonRef = useRef<View>(null);

  const handleMorePress = () => {
    moreButtonRef.current?.measure(
      (_x: number, _y: number, _width: number, height: number, _pageX: number, pageY: number) => {
        setMenuPosition({
          top: pageY + height + theme.spacing.sm,
          right: theme.spacing.md,
        });
        setMenuVisible(true);
      },
    );
  };

  return {
    menuVisible,
    menuPosition,
    moreButtonRef,
    handleMorePress,
    setMenuVisible,
  };
};

export default useTweetDropDownMenu;
