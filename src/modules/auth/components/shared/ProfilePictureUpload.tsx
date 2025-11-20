import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions } from 'react-native';
import Toast from 'react-native-toast-message';

interface ProfilePictureUploadProps {
  onImageSelected?: (file: { uri: string; name: string; type: string }) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ onImageSelected }) => {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();

  const scaleWidth = Math.min(Math.max(width / 390, 0.85), 1.1);
  const scaleHeight = Math.min(Math.max(height / 844, 0.85), 1.1);
  const scaleFonts = Math.min(scaleWidth, scaleHeight);

  const styles = useMemo(
    () => createStyles(theme, scaleWidth, scaleHeight, scaleFonts),
    [theme, scaleWidth, scaleHeight, scaleFonts],
  );

  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permission denied',
          text2: 'We need permission to access your photos.',
        });
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        const fileName = uri.split('/').pop() || 'profile-picture.jpg';
        const fileType = result.assets[0].mimeType || 'image/jpeg';

        setImageUri(uri);
        onImageSelected?.({
          uri,
          name: fileName,
          type: fileType,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to pick image. Please try again.',
      });
    }
  };

  return (
    <Pressable
      onPress={pickImage}
      style={styles.uploadContainer}
      accessibilityLabel="Upload profile picture"
      accessibilityRole="button"
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.previewImage} />
      ) : (
        <>
          <ImagePlus color={theme.colors.text.link} size={48 * scaleFonts} strokeWidth={1.5} />
          <Text style={styles.uploadText}>Upload</Text>
        </>
      )}
    </Pressable>
  );
};

const createStyles = (theme: Theme, scaleWidth = 1, scaleHeight = 1, scaleFonts = 1) =>
  StyleSheet.create({
    uploadContainer: {
      width: 200 * scaleWidth,
      height: 200 * scaleHeight,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.colors.text.link,
      backgroundColor: theme.colors.background.primary,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      overflow: 'hidden',
    },
    uploadText: {
      marginTop: theme.spacing.md * scaleHeight,
      color: theme.colors.text.link,
      fontSize: theme.typography.sizes.lg * scaleFonts,
      fontFamily: theme.typography.fonts.medium,
    },
    previewImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
  });

export default ProfilePictureUpload;
