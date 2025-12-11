import NotFoundPage from '@/app/404';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

// Mocks
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('NotFoundPage', () => {
  it('should render message', () => {
    renderWithTheme(<NotFoundPage />);
    expect(screen.getByText('404 - Page not found')).toBeTruthy();
  });

  it('should render home button', () => {
    renderWithTheme(<NotFoundPage />);
    fireEvent.press(screen.getByRole('button'));
    expect(mockReplace).toHaveBeenCalledWith('/(protected)');
  });
});
