import React from 'react';
import { StyleProp, Text, TextInput, TextStyle, View, ViewStyle } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useRTL } from '../../../hooks/useRTL';
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
  testID?: string;
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
  testID,
}) => {
  const { theme } = useTheme();
  const isRTL = useRTL();
  const editModalStyles = createEditModalStyles(theme, isRTL);
  const defaultPlaceholderColor = placeholderTextColor || theme.colors.text.secondary;

  return (
    <View style={style} testID={testID}>
      <Text style={editModalStyles.label}>{label}</Text>
      <TextInput
        style={inputStyle}
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholderTextColor={defaultPlaceholderColor}
        textAlign={isRTL ? 'right' : 'left'}
        testID={testID ? `${testID}_field` : undefined}
      />
    </View>
  );
};

export default Input;
