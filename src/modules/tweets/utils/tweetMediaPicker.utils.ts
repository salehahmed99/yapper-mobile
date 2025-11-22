import * as ImagePicker from 'expo-image-picker';
// eslint-disable-next-line react-native/split-platform-components
import { ActionSheetIOS, Alert, Platform } from 'react-native';

export type MediaAsset = {
  uri: string;
  type: 'image' | 'video';
  mimeType: string;
  duration?: number; // For videos
};

/**
 * Pick multiple media items (images or videos) from library
 * Allows up to maxItems selections
 */
export const pickMediaFromLibrary = async (maxItems: number = 4): Promise<MediaAsset[]> => {
  try {
    // Check permission status first
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();

    let finalStatus = status;

    // Only request if not already granted
    if (status !== 'granted') {
      const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      finalStatus = newStatus;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library in Settings to select media.', [
        { text: 'OK' },
      ]);
      return [];
    }

    // Launch image picker with multiple selection
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'], // Both images and videos
      allowsMultipleSelection: true,
      selectionLimit: maxItems,
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return [];
    }

    // Convert assets to MediaAsset format
    const mediaAssets: MediaAsset[] = result.assets.map((asset) => {
      // Determine type from type or mimeType
      let type: 'image' | 'video' = 'image';
      if (asset.type === 'video' || asset.mimeType?.startsWith('video/')) {
        type = 'video';
      }

      return {
        uri: asset.uri,
        type,
        mimeType: asset.mimeType || (type === 'video' ? 'video/mp4' : 'image/jpeg'),
        duration: asset.duration ?? undefined, // Videos have duration in milliseconds
      };
    });

    return mediaAssets;
  } catch (error) {
    console.warn('Error picking media from library:', error);
    Alert.alert('Error', 'Failed to pick media from library');
    return [];
  }
};

/**
 * Take a photo or video using the device camera
 */
export const captureMedia = async (mediaType: 'photo' | 'video' = 'photo'): Promise<MediaAsset | null> => {
  try {
    // Check camera permission
    const { status } = await ImagePicker.getCameraPermissionsAsync();

    let finalStatus = status;

    if (status !== 'granted') {
      const { status: newStatus } = await ImagePicker.requestCameraPermissionsAsync();
      finalStatus = newStatus;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your camera in Settings to capture media.', [
        { text: 'OK' },
      ]);
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: mediaType === 'video' ? ['videos'] : ['images'],
      quality: 0.8,
      videoMaxDuration: 300, // 5 minutes max video
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const type = mediaType === 'video' ? 'video' : 'image';

    return {
      uri: asset.uri,
      type,
      mimeType: asset.mimeType || (type === 'video' ? 'video/mp4' : 'image/jpeg'),
      duration: asset.duration ?? undefined,
    };
  } catch (error) {
    console.warn(`Error capturing ${mediaType}:`, error);
    Alert.alert('Error', `Failed to capture ${mediaType}`);
    return null;
  }
};

/**
 * Show camera options to take photo or video
 */
export const showCameraOptions = async (onMediaSelected: (media: MediaAsset | null) => void) => {
  const options = ['Take Photo', 'Take Video', 'Cancel'];
  const cancelButtonIndex = 2;

  const handleTakePhoto = async () => {
    const media = await captureMedia('photo');
    if (media) {
      onMediaSelected(media);
    }
  };

  const handleTakeVideo = async () => {
    const media = await captureMedia('video');
    if (media) {
      onMediaSelected(media);
    }
  };

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex: number) => {
        if (buttonIndex === 0) {
          handleTakePhoto();
        } else if (buttonIndex === 1) {
          handleTakeVideo();
        }
      },
    );
  } else {
    // Android Alert
    Alert.alert('Capture Media', 'Choose what to capture', [
      {
        text: 'Take Photo',
        onPress: handleTakePhoto,
      },
      {
        text: 'Take Video',
        onPress: handleTakeVideo,
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  }
};

/**
 * Show media picker options for adding media to tweet
 */
export const showMediaPickerOptions = async (onMediaSelected: (media: MediaAsset[]) => void, maxItems: number = 4) => {
  const options = ['Choose from Library', 'Take Photo', 'Take Video', 'Cancel'];
  const cancelButtonIndex = 3;

  const handleLibraryPick = async () => {
    const media = await pickMediaFromLibrary(maxItems);
    if (media.length > 0) {
      onMediaSelected(media);
    }
  };

  const handleTakePhoto = async () => {
    const media = await captureMedia('photo');
    if (media) {
      onMediaSelected([media]);
    }
  };

  const handleTakeVideo = async () => {
    const media = await captureMedia('video');
    if (media) {
      onMediaSelected([media]);
    }
  };

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex: number) => {
        if (buttonIndex === 0) {
          handleLibraryPick();
        } else if (buttonIndex === 1) {
          handleTakePhoto();
        } else if (buttonIndex === 2) {
          handleTakeVideo();
        }
      },
    );
  } else {
    // Android Alert
    Alert.alert('Add Media', 'Choose where to get media from', [
      {
        text: 'Choose from Library',
        onPress: handleLibraryPick,
      },
      {
        text: 'Take Photo',
        onPress: handleTakePhoto,
      },
      {
        text: 'Take Video',
        onPress: handleTakeVideo,
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  }
};
