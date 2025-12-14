import { useNavigation } from '@/src/hooks/useNavigation';
import UserNameScreenShared from '@/src/modules/auth/components/shared/UserNameScreenShared';
import { useSignUpStore } from '@/src/modules/auth/store/useSignUpStore';
import { updateUserName } from '@/src/services/userService';
import { useAuthStore } from '@/src/store/useAuthStore';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';

const UserNameScreen: React.FC = () => {
  const { t } = useTranslation();
  const { navigate, replace } = useNavigation();

  // Zustand store
  const email = useSignUpStore((state) => state.email);
  const userNames = useSignUpStore((state) => state.userNames);

  const setSkipRedirect = useAuthStore((state) => state.setSkipRedirect);

  // Redirect if no email or usernames (user shouldn't be here)
  useEffect(() => {
    if (!email || !userNames || userNames.length === 0) {
      replace('/(auth)/sign-up/create-account-screen');
    }
  }, [email, userNames, replace]);

  const handleNext = async (username: string) => {
    const userNamesParam = useSignUpStore.getState().userNames;
    if (username === userNamesParam[0]) {
      setSkipRedirect(false);
      replace('/(protected)');
      return;
    }

    await updateUserName(username);

    Toast.show({
      type: 'success',
      text1: t('auth.signUp.userName.success.usernameSet'),
      text2: t('auth.signUp.userName.success.yourUsername', { username }),
    });
    setSkipRedirect(false);
    replace('/(protected)');
  };

  const handleSkip = () => {
    setSkipRedirect(false);
    navigate('/(protected)');
  };

  return (
    <UserNameScreenShared
      availableUsernames={userNames}
      onNext={handleNext}
      onSkip={handleSkip}
      translations={{
        title: t('auth.signUp.userName.title'),
        subtitle: t('auth.signUp.userName.subtitle'),
        label: t('auth.signUp.userName.usernameLabel'),
        next: t('buttons.next'),
        skipForNow: t('auth.signUp.userName.skipButton'),
        showMore: t('auth.signUp.userName.showMore'),
        showLess: t('auth.signUp.userName.showLess'),
        minLengthError: t('auth.signUp.userName.errors.minLength'),
        errorToast: t('auth.signUp.userName.errors.error'),
        invalidFormatToast: t('auth.signUp.userName.errors.usernameFormat'),
        usernameRequiredTitle: t('auth.signUp.userName.errors.usernameRequired'),
        usernameRequiredMessage: t('auth.signUp.userName.errors.selectOrEnter'),
      }}
    />
  );
};

export default UserNameScreen;
