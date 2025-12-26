import { ThemeProvider } from '@/src/context/ThemeContext';
import TypingIndicator from '@/src/modules/chat/components/TypingIndicator';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

// Mock Animated loop/sequence/timing
jest.mock('react-native/Libraries/Animated/Animated', () => {
  const ActualAnimated = jest.requireActual('react-native/Libraries/Animated/Animated');
  return {
    ...ActualAnimated,
    loop: () => ({ start: jest.fn(), stop: jest.fn() }),
    sequence: jest.fn(),
    timing: () => ({ start: jest.fn() }),
  };
});

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('TypingIndicator', () => {
  it('should render', () => {
    renderWithTheme(<TypingIndicator />);
    expect(screen.getByTestId('typing_indicator_container')).toBeTruthy();
  });
});
