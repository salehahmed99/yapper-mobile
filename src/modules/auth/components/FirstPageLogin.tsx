import { View, TextInput, Text, Animated,StyleSheet } from 'react-native';
import { useState, useRef, useEffect } from 'react';

interface IFirstPageLoginProps {
  text: string;
  onTextChange: (text: string) => void;
}

const FirstPageLogin: React.FC<IFirstPageLoginProps> = ({ text, onTextChange }) => {
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

const firstPageLoginStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 15,
    paddingTop: 32,
  },
  title: {
    color: '#E7E9EA',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: 32,
    letterSpacing: -0.3,
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  input: {
    height: 56,
    backgroundColor: '#000000',
    borderColor: '#333639',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#E7E9EA',
    fontSize: 17,
    width: '100%',
  },
  inputFocused: {
    borderColor: '#1D9BF0',
    borderWidth: 2,
  },
});

export default FirstPageLogin;
