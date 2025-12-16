import * as ImagePicker from 'expo-image-picker';
import { ActionSheetIOS, Alert, Platform } from 'react-native';
import { pickImageFromLibrary, showImagePickerOptions, takePicture } from '../edit-profile.utils';

// Mock dependencies
jest.mock('expo-image-picker');
jest.mock('@/src/constants/defaults', () => ({
  DEFAULT_AVATAR_URL: 'default-avatar-url',
  DEFAULT_BANNER_URL: 'default-banner-url',
}));

describe('edit-profile.utils', () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  describe('pickImageFromLibrary', () => {
    it('should ask for permissions if not granted and return null if denied', async () => {
      // Mock initial permission as denied/undetermined
      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      // Mock request permission as denied
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await pickImageFromLibrary(true);

      expect(ImagePicker.getMediaLibraryPermissionsAsync).toHaveBeenCalled();
      expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Permission Required',
        expect.stringContaining('allow access to your photo library'),
        expect.any(Array),
      );
      expect(result).toBeNull();
    });

    it('should return null if permissions are initially denied and request is denied', async () => {
      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await pickImageFromLibrary(true);
      expect(result).toBeNull();
    });

    it('should launch image library if permissions are granted', async () => {
      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'selected-image-uri' }],
      });

      const result = await pickImageFromLibrary(true);

      expect(ImagePicker.requestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          aspect: [1, 1], // because isAvatar is true
        }),
      );
      expect(result).toBe('selected-image-uri');
    });

    it('should use correct aspect ratio for banner', async () => {
      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
        assets: [],
      });

      await pickImageFromLibrary(false); // isAvatar = false

      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          aspect: [3, 1],
        }),
      );
    });

    it('should return null if selection is canceled', async () => {
      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
        assets: null,
      });

      const result = await pickImageFromLibrary(true);
      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockRejectedValue(new Error('Test error'));

      const result = await pickImageFromLibrary(true);

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to pick image from library');
      expect(result).toBeNull();
    });
  });

  describe('takePicture', () => {
    it('should ask for permissions if not granted and return null if denied', async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await takePicture(true);

      expect(ImagePicker.getCameraPermissionsAsync).toHaveBeenCalled();
      expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Permission Required',
        expect.stringContaining('allow access to your camera'),
        expect.any(Array),
      );
      expect(result).toBeNull();
    });

    it('should launch camera if permissions are granted', async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'captured-image-uri' }],
      });

      const result = await takePicture(true);

      expect(ImagePicker.requestCameraPermissionsAsync).not.toHaveBeenCalled();
      expect(ImagePicker.launchCameraAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          aspect: [1, 1],
        }),
      );
      expect(result).toBe('captured-image-uri');
    });

    it('should use correct aspect ratio for banner', async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: true,
        assets: [],
      });

      await takePicture(false);

      expect(ImagePicker.launchCameraAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          aspect: [3, 1],
        }),
      );
    });

    it('should return null if capture is canceled', async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: true,
        assets: null,
      });

      const result = await takePicture(true);
      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockRejectedValue(new Error('Test error'));

      const result = await takePicture(true);

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to take picture');
      expect(result).toBeNull();
    });
  });

  describe('showImagePickerOptions', () => {
    const mockOnSelected = jest.fn();
    const mockOnDeleted = jest.fn();

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('iOS', () => {
      beforeAll(() => {
        Platform.OS = 'ios';
      });

      it('should show ActionSheetIOS with delete option', () => {
        const spy = jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions');
        showImagePickerOptions(true, mockOnSelected, mockOnDeleted, true);

        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({
            options: ['Choose from Library', 'Take Picture', 'Delete Image', 'Cancel'],
            destructiveButtonIndex: 2,
            cancelButtonIndex: 3,
          }),
          expect.any(Function),
        );
      });

      it('should show ActionSheetIOS without delete option', () => {
        const spy = jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions');
        showImagePickerOptions(true, mockOnSelected, mockOnDeleted, false);

        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({
            options: ['Choose from Library', 'Take Picture', 'Cancel'],
            destructiveButtonIndex: undefined,
            cancelButtonIndex: 2,
          }),
          expect.any(Function),
        );
      });

      it('should handle Library pick (index 0)', async () => {
        // Mock pickImageFromLibrary internal call slightly complex as it's in same module
        // But since we are testing index mapping, we can mock the import or just rely on image picker mocks
        // Better: we can assume pickImageFromLibrary logic is tested above, and here we just check if it triggers

        // However, `pickImageFromLibrary` is imported from the same file. To mock it within the same module is tricky without rewiring.
        // Instead, let's rely on the mocks we set up for ImagePicker to know if it was called.

        (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
          cancelled: false,
          assets: [{ uri: 'lib-uri' }],
        });

        const spy = jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions');
        showImagePickerOptions(true, mockOnSelected, mockOnDeleted, true);

        const callback = spy.mock.calls[0][1];
        await callback(0); // Simulate "Choose from Library"

        expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
        // We'd expect mockOnSelected to be called if image pick succeeds.
        // Waiting for promise resolution might be needed if not awaited inside showImagePickerOptions (call is fire-and-forget from ActionSheet)
        // Since handleLibraryPick is async but called synchronously, we might need to wait.
        await new Promise(process.nextTick);
        expect(mockOnSelected).toHaveBeenCalledWith('lib-uri');
      });

      it('should handle Delete option (index 2)', () => {
        const spy = jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions');
        showImagePickerOptions(true, mockOnSelected, mockOnDeleted, true);
        const callback = spy.mock.calls[0][1];
        callback(2);
        expect(mockOnDeleted).toHaveBeenCalled();
      });
    });

    describe('Android', () => {
      beforeAll(() => {
        Platform.OS = 'android';
      });

      // Note: We need to spy on Alert.alert for Android
      it('should show Alert with delete option', () => {
        showImagePickerOptions(true, mockOnSelected, mockOnDeleted, true);

        expect(Alert.alert).toHaveBeenCalledWith(
          'Change Image',
          'Choose an option',
          expect.any(Array),
          expect.any(Object),
        );

        const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
        expect(buttons).toHaveLength(4); // Library, Camera, Delete, Cancel
        expect(buttons[2].text).toBe('Delete Image');
      });

      it('should show Alert without delete option', () => {
        showImagePickerOptions(true, mockOnSelected, mockOnDeleted, false);

        const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
        expect(buttons).toHaveLength(3); // Library, Camera, Cancel
        const hasDelete = buttons.some((b: any) => b.text === 'Delete Image');
        expect(hasDelete).toBeFalsy();
      });

      it('should call handlers from Alert buttons', async () => {
        // Mock ImagePicker for success
        (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
          canceled: false,
          assets: [{ uri: 'lib-uri-android' }],
        });

        showImagePickerOptions(true, mockOnSelected, mockOnDeleted, true);
        const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];

        // Find Library button
        const libraryBtn = buttons.find((b: any) => b.text === 'Choose from Library');
        await libraryBtn.onPress();

        await new Promise(process.nextTick);
        expect(mockOnSelected).toHaveBeenCalledWith('lib-uri-android');
      });
    });
  });
});
