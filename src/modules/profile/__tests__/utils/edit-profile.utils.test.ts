// Mock expo-image-picker
jest.mock('expo-image-picker');

// Use jest.mock which is hoisted
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    select: jest.fn((obj) => obj.android || obj.default),
  },
  Alert: {
    alert: jest.fn(),
  },
  ActionSheetIOS: {
    showActionSheetWithOptions: jest.fn(),
  },
}));

import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import {
  DEFAULT_AVATAR_URI,
  DEFAULT_BANNER_URI,
  pickImageFromLibrary,
  showImagePickerOptions,
  takePicture,
} from '../../utils/edit-profile.utils';

describe('edit-profile.utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset our convenience variable if we used one, or just clear the mock directly
    (Alert.alert as jest.Mock).mockClear();
    // Link our local mock if we want, or just use Alert.alert directly
    // For the tests below that use mockAlertFn, we should update them to use Alert.alert
  });

  describe('DEFAULT_AVATAR_URI and DEFAULT_BANNER_URI', () => {
    it('should export default URIs', () => {
      expect(DEFAULT_AVATAR_URI).toBeDefined();
      expect(DEFAULT_BANNER_URI).toBeDefined();
    });
  });

  describe('pickImageFromLibrary', () => {
    it('should return image URI when permission is granted and image is selected', async () => {
      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'selected-image.jpg' }],
      });

      const result = await pickImageFromLibrary(true);

      expect(result).toBe('selected-image.jpg');
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
        base64: false,
        exif: false,
      });
    });

    it('should use banner aspect ratio when isAvatar is false', async () => {
      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'banner.jpg' }],
      });

      const result = await pickImageFromLibrary(false);

      expect(result).toBe('banner.jpg');
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          aspect: [3, 1],
        }),
      );
    });

    it('should request permission when not granted', async () => {
      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'image.jpg' }],
      });

      const result = await pickImageFromLibrary(true);

      expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
      expect(result).toBe('image.jpg');
    });

    it('should return null and show alert when permission denied after request', async () => {
      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

      const result = await pickImageFromLibrary(true);

      expect(result).toBeNull();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Permission Required',
        'Please allow access to your photo library in Settings to select images.',
        [{ text: 'OK' }],
      );
    });

    it('should return null when user cancels selection', async () => {
      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      const result = await pickImageFromLibrary(true);

      expect(result).toBeNull();
    });

    it('should return null and show alert on error', async () => {
      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockRejectedValue(new Error('Permission error'));

      const result = await pickImageFromLibrary(true);

      expect(result).toBeNull();
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to pick image from library');
    });

    it('should return null when no assets are returned', async () => {
      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [],
      });

      const result = await pickImageFromLibrary(true);

      expect(result).toBeNull();
    });
  });

  describe('takePicture', () => {
    it('should return image URI when camera permission is granted', async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'camera-image.jpg' }],
      });

      const result = await takePicture(true);

      expect(result).toBe('camera-image.jpg');
      expect(ImagePicker.launchCameraAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        }),
      );
    });

    it('should use banner aspect ratio for non-avatar', async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'banner.jpg' }],
      });

      await takePicture(false);

      expect(ImagePicker.launchCameraAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          aspect: [3, 1],
        }),
      );
    });

    it('should request camera permission when not granted', async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'photo.jpg' }],
      });

      const result = await takePicture(true);

      expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
      expect(result).toBe('photo.jpg');
    });

    it('should return null and show alert when camera permission denied after request', async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

      const result = await takePicture(true);

      expect(result).toBeNull();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Permission Required',
        'Please allow access to your camera in Settings to take pictures.',
        [{ text: 'OK' }],
      );
    });

    it('should return null when user cancels camera', async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      const result = await takePicture(true);

      expect(result).toBeNull();
    });

    it('should return null and show alert on camera error', async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockRejectedValue(new Error('Camera error'));

      const result = await takePicture(true);

      expect(result).toBeNull();
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to take picture');
    });

    it('should return null when no assets are returned from camera', async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [],
      });

      const result = await takePicture(true);

      expect(result).toBeNull();
    });
  });

  describe('showImagePickerOptions', () => {
    const mockOnImageSelected = jest.fn();
    const mockOnImageDeleted = jest.fn();

    beforeEach(() => {
      mockOnImageSelected.mockClear();
      mockOnImageDeleted.mockClear();
    });

    it('should show Alert with delete option when showDelete is true', () => {
      showImagePickerOptions(true, mockOnImageSelected, mockOnImageDeleted, true);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Change Image',
        'Choose an option',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Choose from Library' }),
          expect.objectContaining({ text: 'Take Picture' }),
          expect.objectContaining({ text: 'Delete Image', style: 'destructive' }),
          expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
        ]),
        expect.objectContaining({ cancelable: true }),
      );
    });

    it('should show Alert without delete option when showDelete is false', () => {
      showImagePickerOptions(true, mockOnImageSelected, mockOnImageDeleted, false);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Change Image',
        'Choose an option',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Choose from Library' }),
          expect.objectContaining({ text: 'Take Picture' }),
          expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
        ]),
        expect.objectContaining({ cancelable: true }),
      );
    });

    it('should call handleLibraryPick when Choose from Library is pressed', async () => {
      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'library-image.jpg' }],
      });

      showImagePickerOptions(true, mockOnImageSelected, mockOnImageDeleted, true);

      // Get the alert buttons
      const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
      const libraryButton = alertButtons.find((b: { text: string }) => b.text === 'Choose from Library');

      await libraryButton.onPress();

      expect(mockOnImageSelected).toHaveBeenCalledWith('library-image.jpg');
    });

    it('should call handleTakePicture when Take Picture is pressed', async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'camera-image.jpg' }],
      });

      showImagePickerOptions(true, mockOnImageSelected, mockOnImageDeleted, true);

      const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
      const cameraButton = alertButtons.find((b: { text: string }) => b.text === 'Take Picture');

      await cameraButton.onPress();

      expect(mockOnImageSelected).toHaveBeenCalledWith('camera-image.jpg');
    });

    it('should call onImageDeleted when Delete Image is pressed', () => {
      showImagePickerOptions(true, mockOnImageSelected, mockOnImageDeleted, true);

      const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
      const deleteButton = alertButtons.find((b: { text: string }) => b.text === 'Delete Image');

      deleteButton.onPress();

      expect(mockOnImageDeleted).toHaveBeenCalled();
    });

    it('should not call onImageSelected when library pick is cancelled', async () => {
      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      showImagePickerOptions(true, mockOnImageSelected, mockOnImageDeleted, true);

      const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
      const libraryButton = alertButtons.find((b: { text: string }) => b.text === 'Choose from Library');

      await libraryButton.onPress();

      expect(mockOnImageSelected).not.toHaveBeenCalled();
    });

    it('should not call onImageSelected when camera is cancelled', async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      showImagePickerOptions(true, mockOnImageSelected, mockOnImageDeleted, true);

      const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
      const cameraButton = alertButtons.find((b: { text: string }) => b.text === 'Take Picture');

      await cameraButton.onPress();

      expect(mockOnImageSelected).not.toHaveBeenCalled();
    });

    it('should use isAvatar false for banner images', () => {
      showImagePickerOptions(false, mockOnImageSelected, mockOnImageDeleted, true);

      expect(Alert.alert).toHaveBeenCalled();
    });
  });
});
