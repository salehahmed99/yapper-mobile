import { ThemeProvider } from '@/src/context/ThemeContext';
import ChatHeader from '@/src/modules/chat/components/ChatHeader';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ChatHeader', () => {
  const mockOnBack = jest.fn();
  const mockOnInfo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render user info', () => {
    renderWithTheme(<ChatHeader name="Test User" username="testuser" onBack={mockOnBack} />);
    expect(screen.getByText('Test User')).toBeTruthy();
    expect(screen.getByText('@testuser')).toBeTruthy();
  });

  it('should handle back press', () => {
    renderWithTheme(<ChatHeader name="Test User" username="testuser" onBack={mockOnBack} />);
    fireEvent.press(screen.getByTestId('chat_header_back_button'));
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should render info button when onInfo provided', () => {
    renderWithTheme(<ChatHeader name="Test User" username="testuser" onBack={mockOnBack} onInfo={mockOnInfo} />);
    expect(screen.getByTestId('chat_header_info_button')).toBeTruthy();
    fireEvent.press(screen.getByTestId('chat_header_info_button'));
    expect(mockOnInfo).toHaveBeenCalled();
  });
});
