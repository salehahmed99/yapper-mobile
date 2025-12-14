import { useNavigation } from '@/src/hooks/useNavigation';
import UserNameScreenShared from '@/src/modules/auth/components/shared/UserNameScreenShared';
import { updateUserName } from '@/src/services/userService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const UserNameScreen: React.FC = () => {
  const { t } = useTranslation();
  const { userNames: userNamesParam } = useLocalSearchParams();
  const setSkipRedirect = useAuthStore((state) => state.setSkipRedirect);
  const { navigate } = useNavigation();

  // Parse userNames from params
  const availableUsernames = useMemo(() => {
    if (Array.isArray(userNamesParam)) return userNamesParam;
    if (typeof userNamesParam === 'string') {
      try {
        return JSON.parse(userNamesParam);
      } catch {
        return [userNamesParam];
      }
    }
    return [];
  }, [userNamesParam]);

  const handleNext = async (username: string) => {
    if (username === availableUsernames[0]) {
      setSkipRedirect(false);
      return;
    }

    await updateUserName(username);
    setSkipRedirect(false);
  };

  const handleSkip = () => {
    setSkipRedirect(false);
    navigate('/(protected)');
  };

  return (
    <UserNameScreenShared
      availableUsernames={availableUsernames}
      onNext={handleNext}
      onSkip={handleSkip}
      translations={{
        title: t('auth.username.title'),
        subtitle: t('auth.username.subtitle'),
        label: t('auth.username.label'),
        next: t('auth.username.next'),
        skipForNow: t('auth.username.skipForNow'),
        showMore: t('auth.username.showMore'),
        showLess: t('auth.username.showLess'),
        minLengthError: t('auth.username.minLengthError'),
        errorToast: t('auth.username.errorToast'),
        invalidFormatToast: t('auth.username.invalidFormatToast'),
        usernameRequiredTitle: t('auth.username.error'),
        usernameRequiredMessage: t('auth.username.selectPrompt'),
      }}
    />
  );
};

export default UserNameScreen;
