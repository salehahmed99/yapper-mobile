import FloatingActionButton from '@/src/components/FloatingActionButton';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { View } from 'react-native';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('FloatingActionButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render icon', () => {
    renderWithTheme(<FloatingActionButton onPress={mockOnPress} icon={<View testID="icon-test" />} />);
    expect(screen.getByTestId('icon-test')).toBeTruthy();
  });

  it('should handle press', () => {
    renderWithTheme(<FloatingActionButton onPress={mockOnPress} icon={<View />} />);
    fireEvent.press(screen.getByTestId('floating_action_button'));
    expect(mockOnPress).toHaveBeenCalled();
  });
});
