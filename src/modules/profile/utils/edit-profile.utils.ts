import * as ImagePicker from 'expo-image-picker';

import { DEFAULT_AVATAR_URL, DEFAULT_BANNER_URL } from '@/src/constants/defaults';
// eslint-disable-next-line react-native/split-platform-components
import { ActionSheetIOS, Alert, Platform } from 'react-native';

export const DEFAULT_AVATAR_URI = DEFAULT_AVATAR_URL;
export const DEFAULT_BANNER_URI = DEFAULT_BANNER_URL;

export const pickImageFromLibrary = async (isAvatar: boolean): Promise<string | null> => {
  try {
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();

    let finalStatus = status;

    if (status !== 'granted') {
      const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      finalStatus = newStatus;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library in Settings to select images.', [
        { text: 'OK' },
      ]);
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: isAvatar ? [1, 1] : [3, 1],
      quality: 0.8,
      allowsMultipleSelection: false,
      base64: false,
      exif: false,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }

    return null;
  } catch {
    Alert.alert('Error', 'Failed to pick image from library');
    return null;
  }
};

export const takePicture = async (isAvatar: boolean): Promise<string | null> => {
  try {
    const { status } = await ImagePicker.getCameraPermissionsAsync();

    let finalStatus = status;

    if (status !== 'granted') {
      const { status: newStatus } = await ImagePicker.requestCameraPermissionsAsync();
      finalStatus = newStatus;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your camera in Settings to take pictures.', [
        { text: 'OK' },
      ]);
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: isAvatar ? [1, 1] : [3, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }

    return null;
  } catch {
    Alert.alert('Error', 'Failed to take picture');
    return null;
  }
};

export const showImagePickerOptions = (
  isAvatar: boolean,
  onImageSelected: (uri: string) => void,
  onImageDeleted: () => void,
  showDelete: boolean = true,
) => {
  const options = showDelete
    ? ['Choose from Library', 'Take Picture', 'Delete Image', 'Cancel']
    : ['Choose from Library', 'Take Picture', 'Cancel'];
  const destructiveButtonIndex = showDelete ? 2 : undefined;
  const cancelButtonIndex = showDelete ? 3 : 2;

  const handleLibraryPick = async () => {
    const uri = await pickImageFromLibrary(isAvatar);
    if (uri) {
      onImageSelected(uri);
    }
  };

  const handleTakePicture = async () => {
    const uri = await takePicture(isAvatar);
    if (uri) {
      onImageSelected(uri);
    }
  };

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        destructiveButtonIndex,
        cancelButtonIndex,
      },
      (buttonIndex: number) => {
        if (buttonIndex === 0) {
          handleLibraryPick();
        } else if (buttonIndex === 1) {
          handleTakePicture();
        } else if (showDelete && buttonIndex === 2) {
          onImageDeleted();
        }
      },
    );
  } else {
    const alertButtons: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }> = [
      {
        text: 'Choose from Library',
        onPress: handleLibraryPick,
      },
      {
        text: 'Take Picture',
        onPress: handleTakePicture,
      },
    ];

    if (showDelete) {
      alertButtons.push({
        text: 'Delete Image',
        onPress: onImageDeleted,
        style: 'destructive',
      });
    }

    alertButtons.push({
      text: 'Cancel',
      style: 'cancel',
    });

    Alert.alert('Change Image', 'Choose an option', alertButtons, {
      cancelable: true,
      onDismiss: () => {},
    });
  }
};
