import React from 'react';
import { useTranslation } from 'react-i18next';
import AuthInputScreen from '../components/shared/AuthInput';
import BottomBar from '../components/shared/BottomBar';
import SuccessScreen from '../components/forgetPassword/SuccessResetPasswordScreen';
import ResetPasswordPage from '../components/forgetPassword/ResetPasswordScreen';
import TopBar from '../components/shared/TopBar';
import { useForgetPasswordFlow, type IFormData, type IStepConfig } from '../hooks/useForgetPasswordFlow';
import { ButtonOptions } from '../utils/enums';

/**
 * ForgetPasswordContainer - UI component for the forget password flow
 *
 * This container handles the presentation layer, delegating all business logic
 * to the useForgetPasswordFlow hook. It manages:
 * - Multi-step form rendering (find account → verify OTP → reset password)
 * - Input field updates via form handlers
 * - Step navigation and validation
 * - Component visibility based on current step
 */
const ForgetPasswordContainer: React.FC = () => {
  const { t } = useTranslation();
  const {
    currentStep,
    formData,
    isNextEnabled,
    isNewPasswordVisible,
    isConfirmPasswordVisible,
    handleChange,
    handleNext,
    handleBack,
    handleToggleNewPasswordVisibility,
    handleToggleConfirmPasswordVisibility,
  } = useForgetPasswordFlow();

  // Step configuration for dynamic rendering
  type Step = 1 | 2 | 3 | 4;

  const stepConfig: Record<Step, IStepConfig> = {
    1: {
      title: t('auth.forgotPassword.findAccountTitle'),
      description: t('auth.forgotPassword.findAccountDescription'),
      label: t('auth.login.emailLabel'),
      field: 'text' as keyof IFormData,
    },
    2: {
      title: t('auth.forgotPassword.verifyCodeTitle'),
      description: t('auth.forgotPassword.verifyCodeDescription'),
      label: t('auth.forgotPassword.verificationCodeLabel'),
      field: 'code' as keyof IFormData,
    },
    3: {
      title: t('auth.login.passwordTitle'),
      description: t('auth.forgotPassword.resetPasswordDescription'),
      label: t('auth.login.passwordLabel'),
      field: 'password' as keyof IFormData,
    },
    4: {
      title: t('auth.forgotPassword.successTitle'),
      description: t('auth.forgotPassword.successDescription'),
      label: '',
      field: 'text' as keyof IFormData, // no input needed
    },
  };

  const currentStepConfig = stepConfig[currentStep as Step];

  return (
    <>
      <TopBar />

      {/* Step 1-2: Input screens */}
      {currentStep <= 2 && (
        <AuthInputScreen
          title={currentStepConfig.title}
          description={currentStepConfig.description}
          label={currentStepConfig.label}
          value={formData[currentStepConfig.field]}
          onChange={handleChange(currentStepConfig.field as keyof typeof formData)}
        />
      )}

      {/* Step 3: Reset password with both new and confirm password fields */}
      {currentStep === 3 && (
        <ResetPasswordPage
          userIdentifier={formData.text}
          newPassword={formData.password}
          confirmPassword={formData.confirmPassword}
          onNewPasswordChange={handleChange('password')}
          onConfirmPasswordChange={handleChange('confirmPassword')}
          onToggleNewPasswordVisibility={handleToggleNewPasswordVisibility}
          onToggleConfirmPasswordVisibility={handleToggleConfirmPasswordVisibility}
          isNewPasswordVisible={isNewPasswordVisible}
          isConfirmPasswordVisible={isConfirmPasswordVisible}
        />
      )}

      {/* Step 4: Success screen */}
      {currentStep === 4 && <SuccessScreen />}

      {/* Navigation buttons (hidden on success) */}
      {currentStep < 4 && (
        <BottomBar
          rightButton={{
            label: ButtonOptions.NEXT,
            onPress: handleNext,
            enabled: isNextEnabled,
            visible: true,
            type: 'primary',
          }}
          leftButton={{
            label: ButtonOptions.BACK,
            onPress: handleBack,
            enabled: currentStep > 1,
            visible: currentStep > 1,
            type: 'secondary',
          }}
        />
      )}
    </>
  );
};

export default ForgetPasswordContainer;
