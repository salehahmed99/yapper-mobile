import { findNodeHandle, UIManager } from 'react-native';
import { ImageOrigin, measureComponentPosition, openImageViewer } from '../../utils/profile-header.utils';

// Mock React Native modules
jest.mock('react-native', () => ({
  findNodeHandle: jest.fn(),
  UIManager: {
    measureInWindow: jest.fn(),
  },
}));

describe('profile-header.utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('measureComponentPosition', () => {
    it('should call callback with measured position when handle exists', () => {
      const mockRef = { current: {} };
      const mockHandle = 12345;
      const mockOrigin: ImageOrigin = { x: 100, y: 200, width: 150, height: 150 };
      const mockCallback = jest.fn();

      (findNodeHandle as jest.Mock).mockReturnValue(mockHandle);
      (UIManager.measureInWindow as jest.Mock).mockImplementation((handle, callback) => {
        callback(mockOrigin.x, mockOrigin.y, mockOrigin.width, mockOrigin.height);
      });

      measureComponentPosition(mockRef, mockCallback);

      expect(findNodeHandle).toHaveBeenCalledWith(mockRef.current);
      expect(UIManager.measureInWindow).toHaveBeenCalledWith(mockHandle, expect.any(Function));
      expect(mockCallback).toHaveBeenCalledWith(mockOrigin);
    });

    it('should not call callback when handle is null', () => {
      const mockRef = { current: null };
      const mockCallback = jest.fn();

      (findNodeHandle as jest.Mock).mockReturnValue(null);

      measureComponentPosition(mockRef, mockCallback);

      expect(findNodeHandle).toHaveBeenCalledWith(mockRef.current);
      expect(UIManager.measureInWindow).not.toHaveBeenCalled();
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should not call callback when handle is undefined', () => {
      const mockRef = { current: {} };
      const mockCallback = jest.fn();

      (findNodeHandle as jest.Mock).mockReturnValue(undefined);

      measureComponentPosition(mockRef, mockCallback);

      expect(findNodeHandle).toHaveBeenCalledWith(mockRef.current);
      expect(UIManager.measureInWindow).not.toHaveBeenCalled();
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should handle different position values', () => {
      const mockRef = { current: {} };
      const mockHandle = 54321;
      const mockCallback = jest.fn();
      const testCases = [
        { x: 0, y: 0, width: 100, height: 100 },
        { x: 50.5, y: 75.3, width: 200, height: 150 },
        { x: 1000, y: 2000, width: 50, height: 50 },
      ];

      testCases.forEach((mockOrigin) => {
        mockCallback.mockClear();
        (findNodeHandle as jest.Mock).mockReturnValue(mockHandle);
        (UIManager.measureInWindow as jest.Mock).mockImplementation((handle, callback) => {
          callback(mockOrigin.x, mockOrigin.y, mockOrigin.width, mockOrigin.height);
        });

        measureComponentPosition(mockRef, mockCallback);

        expect(mockCallback).toHaveBeenCalledWith(mockOrigin);
      });
    });
  });

  describe('openImageViewer', () => {
    it('should measure position and open viewer', () => {
      const mockRef = { current: {} };
      const mockHandle = 12345;
      const mockOrigin: ImageOrigin = { x: 150, y: 250, width: 100, height: 100 };
      const mockSetOrigin = jest.fn();
      const mockSetViewerOpen = jest.fn();

      (findNodeHandle as jest.Mock).mockReturnValue(mockHandle);
      (UIManager.measureInWindow as jest.Mock).mockImplementation((handle, callback) => {
        callback(mockOrigin.x, mockOrigin.y, mockOrigin.width, mockOrigin.height);
      });

      openImageViewer(mockRef, mockSetOrigin, mockSetViewerOpen);

      expect(findNodeHandle).toHaveBeenCalledWith(mockRef.current);
      expect(UIManager.measureInWindow).toHaveBeenCalledWith(mockHandle, expect.any(Function));
      expect(mockSetOrigin).toHaveBeenCalledWith(mockOrigin);
      expect(mockSetViewerOpen).toHaveBeenCalledWith(true);
    });

    it('should not open viewer when handle is null', () => {
      const mockRef = { current: null };
      const mockSetOrigin = jest.fn();
      const mockSetViewerOpen = jest.fn();

      (findNodeHandle as jest.Mock).mockReturnValue(null);

      openImageViewer(mockRef, mockSetOrigin, mockSetViewerOpen);

      expect(findNodeHandle).toHaveBeenCalledWith(mockRef.current);
      expect(mockSetOrigin).not.toHaveBeenCalled();
      expect(mockSetViewerOpen).not.toHaveBeenCalled();
    });

    it('should handle different origin values', () => {
      const mockRef = { current: {} };
      const mockHandle = 99999;
      const mockSetOrigin = jest.fn();
      const mockSetViewerOpen = jest.fn();
      const mockOrigin: ImageOrigin = { x: 300, y: 400, width: 250, height: 250 };

      (findNodeHandle as jest.Mock).mockReturnValue(mockHandle);
      (UIManager.measureInWindow as jest.Mock).mockImplementation((handle, callback) => {
        callback(mockOrigin.x, mockOrigin.y, mockOrigin.width, mockOrigin.height);
      });

      openImageViewer(mockRef, mockSetOrigin, mockSetViewerOpen);

      expect(mockSetOrigin).toHaveBeenCalledWith(mockOrigin);
      expect(mockSetViewerOpen).toHaveBeenCalledWith(true);
    });

    it('should call setViewerOpen with true after setting origin', () => {
      const mockRef = { current: {} };
      const mockHandle = 11111;
      const mockOrigin: ImageOrigin = { x: 0, y: 0, width: 50, height: 50 };
      const mockSetOrigin = jest.fn();
      const mockSetViewerOpen = jest.fn();

      (findNodeHandle as jest.Mock).mockReturnValue(mockHandle);
      (UIManager.measureInWindow as jest.Mock).mockImplementation((handle, callback) => {
        callback(mockOrigin.x, mockOrigin.y, mockOrigin.width, mockOrigin.height);
      });

      openImageViewer(mockRef, mockSetOrigin, mockSetViewerOpen);

      expect(mockSetOrigin).toHaveBeenCalled();
      expect(mockSetViewerOpen).toHaveBeenCalledWith(true);
    });
  });
});
