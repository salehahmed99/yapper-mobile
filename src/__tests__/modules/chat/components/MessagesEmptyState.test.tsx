import { ThemeProvider } from '@/src/context/ThemeContext';
import MessagesEmptyState from '@/src/modules/chat/components/MessagesEmptyState';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('MessagesEmptyState', () => {
  const mockOnWriteMessage = jest.fn();

  it('should render titles', () => {
    renderWithTheme(<MessagesEmptyState onWriteMessage={mockOnWriteMessage} />);
    expect(screen.getByTestId('messages_empty_state_title')).toBeTruthy();
    // Assuming mock translations return keys
  });

  it('should handle write message press', () => {
    renderWithTheme(<MessagesEmptyState onWriteMessage={mockOnWriteMessage} />);
    fireEvent.press(screen.getByTestId('messages_empty_state_button'));
    expect(mockOnWriteMessage).toHaveBeenCalled();
  });
});
