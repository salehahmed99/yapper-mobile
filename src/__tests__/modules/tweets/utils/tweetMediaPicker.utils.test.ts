import {
  captureMedia,
  MediaAsset,
  pickMediaFromLibrary,
  showCameraOptions,
} from '@/src/modules/tweets/utils/tweetMediaPicker.utils';
import { ActionSheetIOS } from 'react-native';

// Mock ImagePicker separately to avoid native module errors
jest.mock('expo-image-picker', () => ({
  getMediaLibraryPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  getCameraPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  ActionSheetIOS: {
    showActionSheetWithOptions: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
}));

// Import after mocking
import * as ImagePicker from 'expo-image-picker';

describe('TweetMediaPicker Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('pickMediaFromLibrary', () => {
    it('should return empty array when permission is denied', async () => {
      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await pickMediaFromLibrary();

      expect(result).toEqual([]);
    });

    it('should return media assets when selection is successful', async () => {
      const mockAsset = {
        uri: 'https://example.com/image.jpg',
        type: 'image',
        mimeType: 'image/jpeg',
      };

      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [mockAsset],
      });

      const result = await pickMediaFromLibrary();

      expect(result).toHaveLength(1);
    });

    it('should support both images and videos', async () => {
      const mockAssets = [
        { uri: 'https://example.com/image.jpg', type: 'image', mimeType: 'image/jpeg' },
        { uri: 'https://example.com/video.mp4', type: 'video', mimeType: 'video/mp4', duration: 5000 },
      ];

      (ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: mockAssets,
      });

      const result = await pickMediaFromLibrary();

      expect(result).toHaveLength(2);
    });
  });

  describe('captureMedia', () => {
    it('should return null when camera permission is denied', async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await captureMedia('photo');

      expect(result).toBeNull();
    });

    it('should capture media successfully', async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'https://example.com/photo.jpg',
            type: 'image',
            mimeType: 'image/jpeg',
          },
        ],
      });

      const result = await captureMedia('photo');

      expect(result).not.toBeNull();
    });
  });

  describe('showCameraOptions', () => {
    it('should show action sheet with camera options', async () => {
      const mockCallback = jest.fn();

      (ActionSheetIOS.showActionSheetWithOptions as jest.Mock).mockImplementation((_options, callback) => {
        callback(2); // Cancel
      });

      await showCameraOptions(mockCallback);

      expect(ActionSheetIOS.showActionSheetWithOptions).toHaveBeenCalled();
    });
  });

  describe('MediaAsset Type', () => {
    it('should properly type MediaAsset', () => {
      const imageAsset: MediaAsset = {
        uri: 'https://example.com/image.jpg',
        type: 'image',
        mimeType: 'image/jpeg',
      };

      expect(imageAsset.type).toBe('image');
    });
  });
});
