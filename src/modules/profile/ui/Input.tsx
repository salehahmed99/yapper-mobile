import React from 'react';
import { StyleProp, Text, TextInput, TextStyle, View, ViewStyle } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { createEditModalStyles } from '../styles/edit-modal-styles';

interface InputProps {
  label: string;
  value: string;
  setValue: (val: string) => void;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  placeholderTextColor?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  setValue,
  style,
  inputStyle,
  placeholder,
  multiline = false,
  numberOfLines,
  placeholderTextColor,
}) => {
  const { theme } = useTheme();
  const editModalStyles = createEditModalStyles(theme);
  const defaultPlaceholderColor = placeholderTextColor || theme.colors.text.secondary;

  return (
    <View style={style}>
      <Text style={editModalStyles.label}>{label}</Text>
      <TextInput
        style={inputStyle}
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholderTextColor={defaultPlaceholderColor}
      />
    </View>
  );
};

export default Input;
