import { Check, Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { Animated, Text, TextInput, TouchableOpacity, View , StyleSheet } from 'react-native';

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
            {password.length >= 8 && (
              <View style={secondPageStyles.statusIcon} accessibilityLabel="Valid password">
                <Check color="#FFFFFF" size={14} />
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const secondPageStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 15,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E7E9EA',
    lineHeight: 36,
    letterSpacing: -0.3,
    marginBottom: 32,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#333639',
    borderRadius: 4,
    paddingHorizontal: 16,
    fontSize: 17,
    color: '#FFFFFF',
    backgroundColor: '#000000',
  },
  inputFocused: {
    borderColor: '#1D9BF0',
    borderWidth: 2,
  },
  disabledInput: {
    color: '#71767B',
    backgroundColor: '#0A0A0A',
  },
  floatingLabel: {
    position: 'absolute',
    left: 12,
    backgroundColor: '#000000',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 40,
    top: 16,
    padding: 4,
  },
  statusIcon: {
    position: 'absolute',
    right: 12,
    top: 20,
    width: 20,
    height: 20,
    borderRadius: 12,
    backgroundColor: '#00BA7C',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SecondPageLogin;
