import { useNavigation } from '@/src/hooks/useNavigation';
import InterestsSelectionScreen from '@/src/modules/auth/components/InterestsSelectionScreen';
import { getCategories, submitInterests } from '@/src/modules/auth/services/signUpService';
import { useSignUpStore } from '@/src/modules/auth/store/useSignUpStore';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';

const InterestsSelectionScreenWrapper: React.FC = () => {
  const { t } = useTranslation();
  const { replace } = useNavigation();

  const email = useSignUpStore((state) => state.email);
  const setSelectedInterests = useSignUpStore((state) => state.setSelectedInterests);

  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if no email (user shouldn't be here)
  useEffect(() => {
    if (!email) {
      replace('/(auth)/sign-up/create-account-screen');
    }
  }, [email, replace]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : t('auth.signUp.interests.errors.generic');
        Toast.show({
          type: 'error',
          text1: t('auth.signUp.interests.errors.loadFailed'),
          text2: message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [t]);

  const handleNext = async (selectedIds: number[]) => {
    try {
      await submitInterests(selectedIds);
      setSelectedInterests(selectedIds);

      Toast.show({
        type: 'success',
        text1: t('auth.signUp.interests.success.title'),
        text2: t('auth.signUp.interests.success.saved'),
      });

      replace('/(auth)/sign-up/user-name-screen');
    } catch (error) {
      const message = error instanceof Error ? error.message : t('auth.signUp.interests.errors.generic');
      Toast.show({
        type: 'error',
        text1: t('auth.signUp.interests.errors.error'),
        text2: message,
      });
    }
  };

  const handleSkip = () => {
    replace('/(auth)/sign-up/user-name-screen');
  };

  return (
    <InterestsSelectionScreen categories={categories} isLoading={isLoading} onNext={handleNext} onSkip={handleSkip} />
  );
};

export default InterestsSelectionScreenWrapper;
