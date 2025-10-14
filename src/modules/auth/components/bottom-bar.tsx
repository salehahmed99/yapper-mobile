import { View, TouchableOpacity, Text } from 'react-native';
import bottomBarStyles from '../styles/bottom-bar-styles';
import React from 'react';

interface BottomBarProps {
  isNextEnabled?: boolean;
  onForgotPassword?: () => void;
  onNext?: () => void;
}

const BottomBar: React.FC<BottomBarProps> = ({ isNextEnabled = false, onForgotPassword, onNext }) => {
  const forgotPasswordPress = () => {
    console.log('Forgot Password Pressed');
    onForgotPassword?.();
  };

  const NextPress = () => {
    if (isNextEnabled) {
      console.log('Next Pressed');
      onNext?.();
    }
  };

  return (
    <View style={bottomBarStyles.container}>
      {/* Thin off-white line above the bar */}
      <View style={bottomBarStyles.topBorder} />

      <View style={bottomBarStyles.content}>
        {/* Forgot Password button on the left */}
        <TouchableOpacity onPress={forgotPasswordPress} style={bottomBarStyles.forgotPasswordButton} activeOpacity={0.7}>
          <Text style={bottomBarStyles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Next button on the right */}
        <TouchableOpacity
          onPress={NextPress}
          style={[bottomBarStyles.nextButton, !isNextEnabled && bottomBarStyles.nextButtonDisabled]}
          activeOpacity={0.7}
          disabled={!isNextEnabled}
        >
          <Text style={[bottomBarStyles.nextButtonText, !isNextEnabled && bottomBarStyles.nextButtonTextDisabled]}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};



export default BottomBar;
