import HomeTabView from '@/src/components/home/HomeTabView';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('HomeTabView', () => {
  it('should render correct tabs', () => {
    renderWithTheme(<HomeTabView />);

    expect(screen.getByText('home.tabs.forYou')).toBeTruthy();
    expect(screen.getByText('home.tabs.following')).toBeTruthy();
  });
});
