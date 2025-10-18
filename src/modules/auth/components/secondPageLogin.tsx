import { Check, Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { Animated, Text, TextInput, TouchableOpacity, View } from 'react-native';
import secondPageStyles from '../styles/secondPageStyles';

interface ISecondPageLoginProps {
  userIdentifier: string;
  password: string;
  onPasswordChange: (password: string) => void;
  onTogglePasswordVisibility?: () => void;
  isPasswordVisible?: boolean;
}

const SecondPageLogin: React.FC<ISecondPageLoginProps> = ({
  userIdentifier,
  password,
  onPasswordChange,
  onTogglePasswordVisibility,
  isPasswordVisible = false,
}) => {
  const [passwordInputFocused, setPasswordInputFocused] = useState(false);
  const passwordInputLabelAnimation = useState(new Animated.Value(password ? 1 : 0))[0];

  const handlePasswordFocus = () => {
    setPasswordInputFocused(true);
    Animated.timing(passwordInputLabelAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handlePasswordBlur = () => {
    setPasswordInputFocused(false);
    if (!password) {
      Animated.timing(passwordInputLabelAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const labelTop = passwordInputLabelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -8],
  });

  const labelFontSize = passwordInputLabelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [17, 13],
  });

  const labelColor = passwordInputLabelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#71767B', passwordInputFocused ? '#1D9BF0' : '#71767B'],
  });

  return (
    <View style={secondPageStyles.container}>
      <Text style={secondPageStyles.title}>Enter your password</Text>

      {/* Disabled User Identifier Input */}
      <View style={secondPageStyles.inputContainer}>
        <TextInput
          style={[secondPageStyles.input, secondPageStyles.disabledInput]}
          value={userIdentifier}
          editable={false}
          placeholderTextColor="#71767B"
        />
      </View>

      {/* Password Input with Floating Label */}
      <View style={secondPageStyles.inputContainer}>
        <Animated.Text
          style={[
            secondPageStyles.floatingLabel,
            {
              top: labelTop,
              fontSize: labelFontSize,
              color: labelColor,
            },
          ]}
        >
          Password
        </Animated.Text>
        <TextInput
          style={[secondPageStyles.input, passwordInputFocused && secondPageStyles.inputFocused]}
          value={password}
          onChangeText={onPasswordChange}
          onFocus={handlePasswordFocus}
          onBlur={handlePasswordBlur}
          secureTextEntry={!isPasswordVisible}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardAppearance="dark"
          placeholderTextColor="#71767B"
        />
        {password.length > 0 && (
          <>
            <TouchableOpacity
              style={secondPageStyles.eyeIcon}
              onPress={onTogglePasswordVisibility}
              accessibilityRole="button"
              accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            >
              {isPasswordVisible ? <EyeOff color="#71767B" size={20} /> : <Eye color="#71767B" size={20} />}
            </TouchableOpacity>

              <View style={secondPageStyles.statusIcon} accessibilityLabel="Valid password">
                <Check color="#FFFFFF" size={14} />
              </View>
          </>
        )}
      </View>
    </View>
  );
};

export default SecondPageLogin;
