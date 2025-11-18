import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { borderRadius, opacity, sizes } from '../../../constants/theme';

type Props = {
  onPress?: () => void;
  style?: ViewStyle;
  children?: React.ReactNode;
};

const IconButton: React.FC<Props> = ({ onPress, style, children }) => {
  return (
    <TouchableOpacity style={[styles.wrapper, style]} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
};

export default IconButton;
const styles = StyleSheet.create({
  wrapper: {
    width: sizes.iconButton.size,
    height: sizes.iconButton.size,
    borderRadius: borderRadius.rounded,
    backgroundColor: `rgba(0,0,0,${opacity.buttonBackground})`,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
