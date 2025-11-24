import React, { ReactNode } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { createDropdownMenuStyles } from '../styles/dropdown-menu-styles';

export interface DropdownMenuItem {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  textColor?: string;
  disabled?: boolean;
  testID?: string;
}

interface IDropdownMenuProps {
  visible: boolean;
  onClose: () => void;
  items: DropdownMenuItem[];
  position?: { top?: number; bottom?: number; left?: number; right?: number };
  containerStyle?: ViewStyle;
  testID?: string;
}

const DropdownMenu: React.FC<IDropdownMenuProps> = ({
  visible,
  onClose,
  items,
  position = { top: 100, right: 16 },
  containerStyle,
  testID,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createDropdownMenuStyles(theme, isDark);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      testID={testID}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityLabel="dropdown_backdrop"
        testID="dropdown_backdrop"
      >
        <View style={[styles.menuContainer, position, containerStyle]}>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <View style={styles.separator} />}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  setTimeout(() => item.onPress(), 100);
                }}
                activeOpacity={0.6}
                disabled={item.disabled}
                testID={item.testID || `dropdown_menu_item_${index}`}
                accessibilityLabel={item.testID || `dropdown_menu_item_${index}`}
                accessibilityRole="menuitem"
              >
                <Text
                  style={[
                    styles.menuItemText,
                    item.textColor && { color: item.textColor },
                    // eslint-disable-next-line react-native/no-inline-styles
                    item.disabled && { opacity: 0.5 },
                  ]}
                >
                  {item.label}
                </Text>
                {item.icon && item.icon}
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
};

export default DropdownMenu;
