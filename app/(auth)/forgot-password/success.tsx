import React, { useEffect } from 'react';
import SuccessScreen from '../../../src/modules/auth/components/forgetPassword/SuccessResetPassword';
import TopBar from '../../../src/modules/auth/components/shared/TopBar';
import { useForgotPasswordStore } from '../../../src/modules/auth/store/useForgetPasswordStore';

const SuccessResetPasswordScreen = () => {
  const reset = useForgotPasswordStore((state) => state.reset);

  // Clear store data on success
  useEffect(() => {
    // Clean up store after a short delay (optional)
    const timer = setTimeout(() => {
      reset();
    }, 1000);

    return () => clearTimeout(timer);
  }, [reset]);

  return (
    <>
      <TopBar />
      <SuccessScreen />
    </>
  );
};

export default SuccessResetPasswordScreen;
