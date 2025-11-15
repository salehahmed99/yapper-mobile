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
import Toast from 'react-native-toast-message';

const UploadPhotoScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Zustand store
  const email = useSignUpStore((state) => state.email);
  const password = useSignUpStore((state) => state.password);

  const [imageFile, setImageFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if no email or password (user shouldn't be here)
  useEffect(() => {
    if (!email || !password) {
      router.replace('/(auth)/sign-up/create-account-screen');
    }
  }, [email, password]);

  const handleImageSelected = (file: { uri: string; name: string; type: string }) => {
    setImageFile(file);
  };

  const handleTopBarBackPress = () => {
    router.replace('/(auth)/landing-screen');
  };

  const handleSkip = () => {
    // Complete sign-up without profile picture
    router.push('/(protected)');
  };

  const handleNext = async () => {
    if (!imageFile) {
      Toast.show({
        type: 'error',
        text1: 'No image selected',
        text2: 'Please upload a profile picture or skip for now.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const uploaded = await uploadProfilePicture(imageFile);

      if (uploaded) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Profile picture uploaded successfully.',
        });
        router.push('/(protected)');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Upload failed',
          text2: 'Failed to upload profile picture. Please try again.',
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ActivityLoader visible={isLoading} />
      <TopBar showExitButton={true} onBackPress={handleTopBarBackPress} />

      <View style={styles.content}>
        <View>
          <AuthTitle title="Pick a profile picture" />
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>Have a favorite selfie? Upload it now.</Text>
        </View>

        <View style={styles.uploadContainer}>
          <ProfilePictureUpload onImageSelected={handleImageSelected} />
        </View>
      </View>

      <BottomBar
        rightButton={{
          label: 'Next',
          onPress: handleNext,
          enabled: !!imageFile && !isLoading,
          visible: true,
          type: 'primary',
        }}
        leftButton={{
          label: 'Skip for now',
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
