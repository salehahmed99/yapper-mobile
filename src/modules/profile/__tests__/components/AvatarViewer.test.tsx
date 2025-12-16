import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from '../../../../context/ThemeContext';
import AvatarViewer from '../../components/AvatarViewer';

// Helper function to render with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    XIcon: () => React.createElement(View, { testID: 'x_icon' }),
  };
});

// Mock the avatar-viewer.utils
jest.mock('../../utils/avatar-viewer.utils', () => ({
  animateClose: jest.fn((fadeAnim, translateY, onClose) => onClose()),
  animateOpen: jest.fn(),
  calculateOpeningAnimation: jest.fn(() => ({
    initialX: 0,
    initialY: 0,
    initialScale: 1,
  })),
  handleSwipeProgress: jest.fn(),
  handleSwipeRelease: jest.fn(),
  resetAnimationValues: jest.fn(),
}));

describe('AvatarViewer', () => {
  const mockOrigin = { x: 100, y: 100, width: 50, height: 50 };
  const mockImageUri = 'https://example.com/avatar.jpg';
  const mockOnClose = jest.fn();
  const mockOnEditRequested = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Visibility', () => {
    it('should not render when not visible', () => {
      const { queryByTestId } = renderWithTheme(
        <AvatarViewer visible={false} imageUri={mockImageUri} origin={mockOrigin} onClose={mockOnClose} />,
      );

      expect(queryByTestId('avatar_viewer_modal')).toBeNull();
    });

    it('should render when visible is true', () => {
      const { toJSON } = renderWithTheme(
        <AvatarViewer visible={true} imageUri={mockImageUri} origin={mockOrigin} onClose={mockOnClose} />,
      );

      // Modal renders something when visible
      expect(toJSON()).not.toBeNull();
    });
  });

  describe('Close Button', () => {
    it('should call onClose when close button is pressed', () => {
      const { getByTestId } = renderWithTheme(
        <AvatarViewer visible={true} imageUri={mockImageUri} origin={mockOrigin} onClose={mockOnClose} />,
      );

      fireEvent.press(getByTestId('avatar_viewer_close_button'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call animateClose when close button is pressed', () => {
      const { animateClose } = require('../../utils/avatar-viewer.utils');
      const { getByTestId } = renderWithTheme(
        <AvatarViewer visible={true} imageUri={mockImageUri} origin={mockOrigin} onClose={mockOnClose} />,
      );

      fireEvent.press(getByTestId('avatar_viewer_close_button'));

      expect(animateClose).toHaveBeenCalled();
    });
  });

  describe('Edit Button', () => {
    it('should render edit button when onEditRequested is provided', () => {
      const { getByTestId } = renderWithTheme(
        <AvatarViewer
          visible={true}
          imageUri={mockImageUri}
          origin={mockOrigin}
          onClose={mockOnClose}
          onEditRequested={mockOnEditRequested}
        />,
      );

      expect(getByTestId('avatar_viewer_edit_button')).toBeTruthy();
    });

    it('should not render edit button when onEditRequested is not provided', () => {
      const { queryByTestId } = renderWithTheme(
        <AvatarViewer visible={true} imageUri={mockImageUri} origin={mockOrigin} onClose={mockOnClose} />,
      );

      expect(queryByTestId('avatar_viewer_edit_button')).toBeNull();
    });

    it('should call onEditRequested when edit button is pressed', () => {
      const { getByTestId } = renderWithTheme(
        <AvatarViewer
          visible={true}
          imageUri={mockImageUri}
          origin={mockOrigin}
          onClose={mockOnClose}
          onEditRequested={mockOnEditRequested}
        />,
      );

      fireEvent.press(getByTestId('avatar_viewer_edit_button'));

      jest.advanceTimersByTime(200);

      expect(mockOnEditRequested).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when edit button is pressed', () => {
      const { getByTestId } = renderWithTheme(
        <AvatarViewer
          visible={true}
          imageUri={mockImageUri}
          origin={mockOrigin}
          onClose={mockOnClose}
          onEditRequested={mockOnEditRequested}
        />,
      );

      fireEvent.press(getByTestId('avatar_viewer_edit_button'));

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Animation Utils', () => {
    it('should call animateOpen when visible with origin', () => {
      const { animateOpen } = require('../../utils/avatar-viewer.utils');

      renderWithTheme(
        <AvatarViewer visible={true} imageUri={mockImageUri} origin={mockOrigin} onClose={mockOnClose} />,
      );

      expect(animateOpen).toHaveBeenCalled();
    });

    it('should call calculateOpeningAnimation when visible with origin', () => {
      const { calculateOpeningAnimation } = require('../../utils/avatar-viewer.utils');

      renderWithTheme(
        <AvatarViewer visible={true} imageUri={mockImageUri} origin={mockOrigin} onClose={mockOnClose} />,
      );

      expect(calculateOpeningAnimation).toHaveBeenCalledWith(mockOrigin, false);
    });

    it('should call calculateOpeningAnimation with isBanner true', () => {
      const { calculateOpeningAnimation } = require('../../utils/avatar-viewer.utils');

      renderWithTheme(
        <AvatarViewer
          visible={true}
          imageUri={mockImageUri}
          origin={mockOrigin}
          onClose={mockOnClose}
          isBanner={true}
        />,
      );

      expect(calculateOpeningAnimation).toHaveBeenCalledWith(mockOrigin, true);
    });

    it('should call resetAnimationValues when not visible', () => {
      const { resetAnimationValues } = require('../../utils/avatar-viewer.utils');

      const { rerender } = renderWithTheme(
        <AvatarViewer visible={true} imageUri={mockImageUri} origin={mockOrigin} onClose={mockOnClose} />,
      );

      rerender(
        <ThemeProvider>
          <AvatarViewer visible={false} imageUri={mockImageUri} origin={mockOrigin} onClose={mockOnClose} />
        </ThemeProvider>,
      );

      expect(resetAnimationValues).toHaveBeenCalled();
    });
  });

  describe('Banner Mode', () => {
    it('should call calculateOpeningAnimation with isBanner true', () => {
      const { calculateOpeningAnimation } = require('../../utils/avatar-viewer.utils');

      renderWithTheme(
        <AvatarViewer
          visible={true}
          imageUri={mockImageUri}
          origin={mockOrigin}
          onClose={mockOnClose}
          isBanner={true}
        />,
      );

      expect(calculateOpeningAnimation).toHaveBeenCalledWith(mockOrigin, true);
    });
  });

  describe('Null Origin', () => {
    it('should not call animateOpen when origin is null', () => {
      const { animateOpen } = require('../../utils/avatar-viewer.utils');
      jest.clearAllMocks();

      renderWithTheme(<AvatarViewer visible={true} imageUri={mockImageUri} origin={null} onClose={mockOnClose} />);

      expect(animateOpen).not.toHaveBeenCalled();
    });
  });
});
