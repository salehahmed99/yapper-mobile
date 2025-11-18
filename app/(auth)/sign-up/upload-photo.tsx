import ActivityLoader from '@/src/components/ActivityLoader';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import BottomBar from '@/src/modules/auth/components/shared/BottomBar';
import ProfilePictureUpload from '@/src/modules/auth/components/shared/ProfilePictureUpload';
import AuthTitle from '@/src/modules/auth/components/shared/Title';
import TopBar from '@/src/modules/auth/components/shared/TopBar';
import { uploadProfilePicture } from '@/src/services/userService';
import { useSignUpStore } from '@/src/modules/auth/store/useSignUpStore';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';

const UploadPhotoScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Zustand store
  const email = useSignUpStore((state) => state.email);

  const [imageFile, setImageFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if no email or password (user shouldn't be here)
  useEffect(() => {
    if (!email) {
      router.replace('/(auth)/sign-up/create-account-screen');
    }
  }, [email]);

  const handleImageSelected = (file: { uri: string; name: string; type: string }) => {
    setImageFile(file);
  };

  const handleSkip = () => {
    // Complete sign-up without profile picture
    router.replace('/(auth)/sign-up/user-name-screen');
  };

  const handleNext = async () => {
    if (!imageFile) {
      Toast.show({
        type: 'error',
        text1: t('auth.signUp.uploadPhoto.errors.noImage'),
        text2: t('auth.signUp.uploadPhoto.errors.uploadOrSkip'),
      });
      return;
    }

    setIsLoading(true);
    try {
      const uploaded = await uploadProfilePicture(imageFile);

      if (uploaded) {
        Toast.show({
          type: 'success',
          text1: t('auth.signUp.uploadPhoto.success.title'),
          text2: t('auth.signUp.uploadPhoto.success.uploaded'),
        });
        router.replace('/(auth)/sign-up/user-name-screen');
      } else {
        Toast.show({
          type: 'error',
          text1: t('auth.signUp.uploadPhoto.errors.uploadFailed'),
          text2: t('auth.signUp.uploadPhoto.errors.tryAgain'),
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('auth.signUp.uploadPhoto.errors.generic');
      Toast.show({ type: 'error', text1: t('auth.signUp.uploadPhoto.errors.error'), text2: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ActivityLoader visible={isLoading} />
      <TopBar showExitButton={false} />

      <View style={styles.content}>
        <View>
          <AuthTitle title={t('auth.signUp.uploadPhoto.title')} />
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{t('auth.signUp.uploadPhoto.description')}</Text>
        </View>

        <View style={styles.uploadContainer}>
          <ProfilePictureUpload onImageSelected={handleImageSelected} />
        </View>
      </View>

      <BottomBar
        rightButton={{
          label: t('buttons.next'),
          onPress: handleNext,
          enabled: !!imageFile && !isLoading,
          visible: true,
          type: 'primary',
        }}
        leftButton={{
          label: t('auth.signUp.uploadPhoto.skipButton'),
          onPress: handleSkip,
          enabled: true,
          visible: true,
          type: 'secondary',
        }}
      />
    </View>
  );
};

export default UploadPhotoScreen;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      flex: 1,
      justifyContent: 'flex-start',
      paddingHorizontal: theme.spacing.xl,
    },
    descriptionContainer: {
      marginBottom: theme.spacing.lg * 2,
    },
    description: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      lineHeight: 20,
    },
    uploadContainer: {
      flex: 1,
      justifyContent: 'flex-start',
    },
  });
