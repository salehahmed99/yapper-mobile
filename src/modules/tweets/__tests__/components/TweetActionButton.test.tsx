import { ThemeProvider } from '@/src/context/ThemeContext';
import TweetActionButton from '@/src/modules/tweets/components/TweetActionButton';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { SvgProps } from 'react-native-svg';

// Mock icon component
const MockIcon: React.FC<SvgProps> = () => <></>;

const mockOnPress = jest.fn();

describe('TweetActionButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider>
        <TweetActionButton icon={MockIcon} onPress={mockOnPress} accessibilityLabel="test_button" {...props} />
      </ThemeProvider>,
    );
  };

  describe('Rendering', () => {
    it('should render without count', () => {
      renderComponent();

      const button = screen.getByLabelText('test_button');
      expect(button).toBeTruthy();
    });

    it('should display count when provided', () => {
      renderComponent({ count: 42 });

      expect(screen.getByText('42')).toBeTruthy();
    });

    it('should format large counts correctly', () => {
      renderComponent({ count: 1500 });

      expect(screen.getByText('1.5K')).toBeTruthy();
    });

    it('should format million counts correctly', () => {
      renderComponent({ count: 2500000 });

      expect(screen.getByText('2.5M')).toBeTruthy();
    });

    it('should not display count when zero', () => {
      renderComponent({ count: 0 });

      expect(screen.queryByText('0')).toBeNull();
    });
  });

  describe('Interactions', () => {
    it('should call onPress when pressed', () => {
      renderComponent();

      const button = screen.getByLabelText('test_button');
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple presses', () => {
      renderComponent();

      const button = screen.getByLabelText('test_button');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });
  });

  describe('Styling', () => {
    it('should apply custom stroke color', () => {
      renderComponent({ strokeColor: '#ff0000' });

      expect(screen.getByLabelText('test_button')).toBeTruthy();
    });

    it('should apply custom fill color', () => {
      renderComponent({ fillColor: '#00ff00' });

      expect(screen.getByLabelText('test_button')).toBeTruthy();
    });

    it('should apply both stroke and fill colors', () => {
      renderComponent({ strokeColor: '#ff0000', fillColor: '#00ff00' });

      expect(screen.getByLabelText('test_button')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility label', () => {
      renderComponent({ accessibilityLabel: 'custom_label' });

      expect(screen.getByLabelText('custom_label')).toBeTruthy();
    });
  });
});
