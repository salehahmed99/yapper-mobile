import * as Localization from 'expo-localization';
import { CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js/max';
import { useCallback, useMemo, useState } from 'react';
import Toast from 'react-native-toast-message';

import { emailSchema, passwordSchema, phoneSchema, usernameSchema } from '../schemas/schemas';
import { requestForgetPassword, resetPassword, verifyOTP } from '../services/forgetPasswordService';
import { Alert } from 'react-native';

// ============================================
// Type Definitions
// ============================================
type TextType = 'email' | 'phone' | 'username' | null;
type Step = 1 | 2 | 3 | 4;

interface IFormData {
  text: string;
  code: string;
  password: string;
  confirmPassword: string;
}

interface IStepConfig {
  title: string;
  description: string;
  label: string;
  field: keyof IFormData;
}

interface IUseForgetPasswordFlowReturn {
  // State
  formData: IFormData;
  currentStep: Step;
  isNextEnabled: boolean;
  resetToken: string;
  isNewPasswordVisible: boolean;
  isConfirmPasswordVisible: boolean;

  // Handlers
  handleChange: (field: keyof IFormData) => (value: string) => void;
  handleNext: () => void;
  handleBack: () => void;
  handleToggleNewPasswordVisibility: () => void;
  handleToggleConfirmPasswordVisibility: () => void;

  // Configuration
  stepConfig: Record<Step, IStepConfig>;
}

// ============================================
// Step Handlers Mapping
// ============================================
type StepHandler = () => void | Promise<void>;

// ============================================
// Custom Hook
// ============================================
export const useForgetPasswordFlow = (): IUseForgetPasswordFlowReturn => {
  // ============================================
  // State Management
  // ============================================
  const [formData, setFormData] = useState<IFormData>({
    text: '',
    code: '',
    password: '',
    confirmPassword: '',
  });

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isNextEnabled, setIsNextEnabled] = useState(false);
  const [textType, setTextType] = useState<TextType>(null);
  const [resetToken, setResetToken] = useState<string>('');
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  // ============================================
  // Hooks & Constants
  // ============================================
  const defaultCountry = Localization.getLocales()[0]?.regionCode || 'US';

  // ============================================
  // Helper Functions
  // ============================================

  /**
   * Detects the type of input (email, phone, or username)
   */
  const detectTextType = useCallback(
    (input: string): TextType => {
      const trimmed = input.trim();

      if (emailSchema.safeParse(trimmed).success) return 'email';

      const phoneNumber = parsePhoneNumberFromString(input, defaultCountry as CountryCode);
      if (
        phoneNumber &&
        phoneNumber.isValid() &&
        phoneNumber.getType() === 'MOBILE' &&
        phoneSchema.safeParse(trimmed).success
      ) {
        return 'phone';
      }

      if (usernameSchema.safeParse(trimmed).success) return 'username';

      return null;
    },
    [defaultCountry],
  );

  /**
   * Validates input for the current step
   */
  const validateStepInput = useCallback(
    (step: Step): boolean => {
      switch (step) {
        case 1: {
          if (!textType) {
            Toast.show({
              type: 'error',
              text1: 'Invalid input',
              text2: 'Please enter a valid email, phone number, or username.',
            });
            return false;
          }
          return true;
        }

        case 2: {
          if (!formData.code || formData.code.trim().length !== 6) {
            Toast.show({
              type: 'error',
              text1: 'Invalid input',
              text2: 'Please enter the 6-digit verification code sent to you.',
            });
            return false;
          }
          return true;
        }

        case 3: {
          if (formData.password.length < 8) {
            Toast.show({
              type: 'error',
              text1: 'Weak Password',
              text2: 'Password must be at least 8 characters long.',
            });
            return false;
          }

          if (formData.password !== formData.confirmPassword) {
            Toast.show({
              type: 'error',
              text1: 'Mismatch',
              text2: 'Passwords do not match. Please try again.',
            });
            return false;
          }

          if (passwordSchema.safeParse(formData.password).success === false) {
            Alert.alert(
              'Invalid Password',
              'Password must be 8-64 characters long and include uppercase, lowercase, number, and special character.',
            );
            return false;
          }

          return true;
        }

        default:
          return true;
      }
    },
    [textType, formData.code, formData.password, formData.confirmPassword],
  );

  // ============================================
  // Step Handlers
  // ============================================

  /**
   * Step 1: Request forget password (send verification code)
   */
  const handleStepOne = useCallback(async () => {
    if (!validateStepInput(1)) return;

    try {
      const isEmailSent = await requestForgetPassword({ identifier: formData.text });

      if (isEmailSent) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'A verification code has been sent to your contact method.',
        });
        setCurrentStep(2);
        setIsNextEnabled(false);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to send verification code. Please try again.',
        });
      }
    } catch (error: unknown) {
      let message = 'Something went wrong';

      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
    }
  }, [formData.text, validateStepInput]);

  /**
   * Step 2: Verify OTP code
   */
  const handleStepTwo = useCallback(async () => {
    if (!validateStepInput(2)) return;

    try {
      const token = await verifyOTP({ identifier: formData.text, token: formData.code });

      if (token) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Verification code accepted. You can now reset your password.',
        });

        setResetToken(token);
        setCurrentStep(3);
        setIsNextEnabled(false);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Invalid verification code. Please try again.',
        });
      }
    } catch (error: unknown) {
      let message = 'Something went wrong';

      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
    }
  }, [formData.text, formData.code, validateStepInput]);

  /**
   * Step 3: Reset password
   */
  const handleStepThree = useCallback(async () => {
    if (!validateStepInput(3)) return;

    try {
      const succeeded = await resetPassword({
        resetToken,
        newPassword: formData.password,
        identifier: formData.text,
      });

      if (succeeded) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Your password has been reset successfully.',
        });
        setCurrentStep(4);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to reset password. Please try again.',
        });
      }
    } catch (error: unknown) {
      let message = 'Something went wrong';

      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
    }
  }, [resetToken, formData.password, formData.text, validateStepInput]);

  // ============================================
  // Step Handler Mapping
  // ============================================
  const stepHandlers = useMemo(
    () => ({
      1: handleStepOne,
      2: handleStepTwo,
      3: handleStepThree,
      4: () => {}, // Success step - no action
    }),
    [handleStepOne, handleStepTwo, handleStepThree],
  ) as Record<Step, StepHandler>;

  // ============================================
  // Event Handlers
  // ============================================

  /**
   * Handles input change for a specific field
   */
  const handleChange = useCallback(
    (field: keyof IFormData) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Update next button state based on field
      if (field === 'text') {
        const type = detectTextType(value);
        setTextType(type);
        setIsNextEnabled(!!type);
      } else if (field === 'code') {
        setIsNextEnabled(value.trim().length === 6);
      } else if (field === 'password' || field === 'confirmPassword') {
        const newPassword = field === 'password' ? value : formData.password;
        const newConfirm = field === 'confirmPassword' ? value : formData.confirmPassword;
        setIsNextEnabled(newPassword.length >= 8 && newPassword === newConfirm);
      }
    },
    [detectTextType, formData.password, formData.confirmPassword],
  );

  /**
   * Handles next button press
   */
  const handleNext = useCallback(() => {
    if (!isNextEnabled || currentStep > 3) return;
    stepHandlers[currentStep]();
  }, [isNextEnabled, currentStep, stepHandlers]);

  /**
   * Handles back button press
   */
  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
      setIsNextEnabled(true);
    }
  }, [currentStep]);

  /**
   * Toggle new password visibility
   */
  const handleToggleNewPasswordVisibility = useCallback(() => {
    setIsNewPasswordVisible((prev) => !prev);
  }, []);

  /**
   * Toggle confirm password visibility
   */
  const handleToggleConfirmPasswordVisibility = useCallback(() => {
    setIsConfirmPasswordVisible((prev) => !prev);
  }, []);

  // ============================================
  // Step Configuration
  // ============================================
  const stepConfig: Record<Step, IStepConfig> = {
    1: {
      title: 'Find your X account',
      description: 'Enter the email, phone number, or username associated with your account to change your password.',
      label: 'Phone, email, or username',
      field: 'text',
    },
    2: {
      title: 'We Sent you a code',
      description: 'Enter the 6-digit code we sent to your email or phone.',
      label: 'Verification code',
      field: 'code',
    },
    3: {
      title: 'Reset Password',
      description: 'Enter your new password and confirm it.',
      label: 'New password',
      field: 'password',
    },
    4: {
      title: 'Success!',
      description: 'Your password has been changed successfully.',
      label: '',
      field: 'text',
    },
  };

  // ============================================
  // Return Hook State & Methods
  // ============================================
  return {
    // State
    formData,
    currentStep,
    isNextEnabled,
    resetToken,
    isNewPasswordVisible,
    isConfirmPasswordVisible,

    // Handlers
    handleChange,
    handleNext,
    handleBack,
    handleToggleNewPasswordVisibility,
    handleToggleConfirmPasswordVisibility,

    // Configuration
    stepConfig,
  };
};

export type { IFormData, IStepConfig, IUseForgetPasswordFlowReturn, Step, TextType };
