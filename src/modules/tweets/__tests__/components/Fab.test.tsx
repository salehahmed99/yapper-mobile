import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import Fab from '../../components/Fab';

// Mock reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock useSpacing
jest.mock('@/src/hooks/useSpacing', () => ({
  __esModule: true,
  default: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock ThemeContext
jest.mock('@/src/context/ThemeContext', () => {
  const React = require('react');
  const { colors, spacing, shadows } = require('@/src/constants/theme');
  return {
    ThemeProvider: ({ children }: any) => React.createElement(React.Fragment, {}, children),
    useTheme: () => ({
      theme: {
        colors: colors.light,
        spacing,
        shadows,
        avatarSizes: { sm: 32 },
        typography: { sizes: { md: 16 } },
      },
    }),
  };
});

const renderWithTheme = (component: React.ReactElement) => {
  // ThemeProvider is already mocked to render children
  return render(component);
};

describe('Fab', () => {
  it('should render correctly', () => {
    const { getByTestId } = renderWithTheme(<Fab />);
    expect(getByTestId('fab_create_post')).toBeTruthy();
  });

  it('should handle press', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithTheme(<Fab onPress={onPress} />);

    fireEvent.press(getByTestId('fab_create_post'));
    expect(onPress).toHaveBeenCalled();
  });
});
