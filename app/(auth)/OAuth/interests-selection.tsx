import { useNavigation } from '@/src/hooks/useNavigation';
import InterestsSelectionScreen from '@/src/modules/auth/components/InterestsSelectionScreen';
import { getCategories, submitInterests } from '@/src/modules/auth/services/signUpService';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';

const InterestsSelectionScreenWrapper: React.FC = () => {
  const { t } = useTranslation();
  const { replace } = useNavigation();

  const { sessionToken: _sessionToken, userNames: userNamesParam } = useLocalSearchParams();

  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Parse userNames from params
  const userNames = useMemo(() => {
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

  // Redirect if no session token (user shouldn't be here)
  useEffect(() => {
    if (!_sessionToken) {
      replace('/(auth)/landing-screen');
    }
  }, [_sessionToken, replace]);

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

      Toast.show({
        type: 'success',
        text1: t('auth.signUp.interests.success.title'),
        text2: t('auth.signUp.interests.success.saved'),
      });

      replace({
        pathname: '/(auth)/OAuth/user-name-screen',
        params: {
          sessionToken: _sessionToken,
          userNames: JSON.stringify(userNames),
        },
      });
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
    replace({
      pathname: '/(auth)/OAuth/user-name-screen',
      params: {
        sessionToken: _sessionToken,
        userNames: JSON.stringify(userNames),
      },
    });
  };

  return (
    <InterestsSelectionScreen categories={categories} isLoading={isLoading} onNext={handleNext} onSkip={handleSkip} />
  );
};

export default InterestsSelectionScreenWrapper;
