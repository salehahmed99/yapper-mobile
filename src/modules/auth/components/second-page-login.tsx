import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import {EyeOff,Eye} from 'lucide-react-native';

interface SecondPageLoginProps {
  userIdentifier: string;
  password: string;
  onPasswordChange: (password: string) => void;
  onTogglePasswordVisibility?: () => void;
  isPasswordVisible?: boolean;
}

const SecondPageLogin: React.FC<SecondPageLoginProps> = ({
  userIdentifier,
  password,
  onPasswordChange,
  onTogglePasswordVisibility,
  isPasswordVisible = false,
}) => {
  const [passwordInputFocused, setPasswordInputFocused] = useState(false);
  const passwordInputLabelAnimation = useState(
    new Animated.Value(password ? 1 : 0)
  )[0];

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
    <View style={styles.container}>
      <Text style={styles.title}>Enter your password</Text>

      {/* Disabled User Identifier Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={userIdentifier}
          editable={false}
          placeholderTextColor="#71767B"
        />
      </View>

      {/* Password Input with Floating Label */}
      <View style={styles.inputContainer}>
        <Animated.Text
          style={[
            styles.floatingLabel,
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
          style={[
            styles.input,
            passwordInputFocused && styles.inputFocused,
          ]}
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
        {/* Eye Icon for Password Visibility Toggle */}
        {password.length > 0 && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={onTogglePasswordVisibility}
          >
                {isPasswordVisible ? <EyeOff color="#71767B" size={20}/> : <Eye color="#71767B" size={20}/>}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    right: 16,
    top: 16,
    padding: 4,
  },
});

export default SecondPageLogin;