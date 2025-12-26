import { ThemeProvider } from '@/src/context/ThemeContext';
import ReactionPicker from '@/src/modules/chat/components/ReactionPicker';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ReactionPicker', () => {
  const mockOnClose = jest.fn();
  const mockOnReactionSelect = jest.fn();

  it('should render reactions', () => {
    renderWithTheme(<ReactionPicker visible={true} onClose={mockOnClose} onReactionSelect={mockOnReactionSelect} />);
    expect(screen.getByText('❤️')).toBeTruthy();
    expect(screen.getByText('😂')).toBeTruthy();
  });

  it('should select reaction', () => {
    renderWithTheme(<ReactionPicker visible={true} onClose={mockOnClose} onReactionSelect={mockOnReactionSelect} />);
    fireEvent.press(screen.getByText('❤️'));
    expect(mockOnReactionSelect).toHaveBeenCalledWith('❤️');
    expect(mockOnClose).toHaveBeenCalled();
  });
});
