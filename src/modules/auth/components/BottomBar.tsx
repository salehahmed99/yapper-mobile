import { View, TouchableOpacity, Text,StyleSheet } from 'react-native';
import React from 'react';
import { ButtonOptions } from '../utils/enums';


interface IBottomBarProps {
   text: ButtonOptions;
  isNextEnabled?: boolean;
  onForgotPassword?: () => void;
  onNext?: () => void;
}

const BottomBar: React.FC<IBottomBarProps> = ({ text=ButtonOptions.NEXT,isNextEnabled = false, onForgotPassword, onNext }) => {
  const forgotPasswordPress = () => {
    onForgotPassword?.();
  };

  const NextPress = () => {
    if (isNextEnabled) {
      onNext?.();
    }
  };
  return(
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
          <Text style={[bottomBarStyles.nextButtonText, !isNextEnabled && bottomBarStyles.nextButtonTextDisabled]}>
            {text}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const bottomBarStyles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000000',
  },
  topBorder: {
    width: '100%',
    height: 1,
    backgroundColor: '#363636ff', // Off-white thin line
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  forgotPasswordButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 20,
    backgroundColor: '#000000',
  },
  forgotPasswordText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '400',
  },
  nextButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  nextButtonDisabled: {
    backgroundColor: '#333333',
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '600',
  },
  nextButtonTextDisabled: {
    color: '#666666',
  },
});

export default BottomBar;


