import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Animated } from 'react-native';
import { ThemeProvider } from '../../../../context/ThemeContext';
import AnimatedProfileHeader from '../../components/AnimatedProfileHeader';

// Helper function to render with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

// Mock expo-blur
jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BlurView: ({ children, style }: { children: React.ReactNode; style?: object }) =>
      React.createElement(View, { style, testID: 'blur_view' }, children),
  };
});

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@/src/hooks/useNavigation', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: jest.fn(),
  }),
}));

describe('AnimatedProfileHeader', () => {
  const mockProps = {
    username: 'testuser',
    bannerUri: 'https://example.com/banner.jpg',
    scrollY: new Animated.Value(0),
    headerHeight: 100,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render header container', () => {
    const { getByTestId } = renderWithTheme(<AnimatedProfileHeader {...mockProps} />);

    expect(getByTestId('animated_profile_header')).toBeTruthy();
  });

  it('should render back button', () => {
    const { getByTestId } = renderWithTheme(<AnimatedProfileHeader {...mockProps} />);

    expect(getByTestId('animated_profile_header_back_button')).toBeTruthy();
  });

  it('should render username', () => {
    const { getByText } = renderWithTheme(<AnimatedProfileHeader {...mockProps} />);

    expect(getByText('testuser')).toBeTruthy();
  });

  it('should call goBack when back button is pressed', () => {
    const { getByTestId } = renderWithTheme(<AnimatedProfileHeader {...mockProps} />);

    fireEvent.press(getByTestId('animated_profile_header_back_button'));

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
