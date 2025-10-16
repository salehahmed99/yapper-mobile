import { View, TextInput, Text, Animated } from 'react-native';
import firstPageLoginStyle from '../styles/firstPageStyles';
import { useState, useRef, useEffect } from 'react';

interface FirstPageLoginProps {
  text: string;
  onTextChange: (text: string) => void;
}

const FirstPageLogin: React.FC<FirstPageLoginProps> = ({ text, onTextChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  const labelPosition = useRef(new Animated.Value(text ? 1 : 0)).current;

  const shouldFloat = isFocused || text.length > 0;

  useEffect(() => {
    Animated.timing(labelPosition, {
      toValue: shouldFloat ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [shouldFloat, labelPosition]);

  const labelStyle = {
    position: 'absolute' as const,
    left: 16,
    top: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -10],
    }),
    fontSize: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [17, 13],
    }),
    color: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: ['#71767B', isFocused ? '#1D9BF0' : '#71767B'],
    }),
    backgroundColor: '#000000',
    paddingHorizontal: 4,
    zIndex: 1,
  };

  return (
    <View style={firstPageLoginStyle.container}>
      <Text style={firstPageLoginStyle.title}>To get started, first enter your phone, email, or @username</Text>

      <View style={firstPageLoginStyle.inputContainer}>
        <Animated.Text style={labelStyle}>Phone, email, or username</Animated.Text>
        <TextInput
          style={[firstPageLoginStyle.input, isFocused && firstPageLoginStyle.inputFocused]}
          value={text}
          onChangeText={onTextChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardAppearance="dark"
        />
      </View>
    </View>
  );
};

export default FirstPageLogin;
