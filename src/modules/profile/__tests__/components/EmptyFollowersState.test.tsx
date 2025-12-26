import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from '../../../../context/ThemeContext';
import EmptyFollowersState from '../../components/EmptyFollowersState';

// Helper function to render with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('EmptyFollowersState', () => {
  it('should render with message', () => {
    const message = 'No followers yet';
    const { getByTestId, getByText } = renderWithTheme(<EmptyFollowersState message={message} />);

    expect(getByTestId('empty_followers_state')).toBeTruthy();
    expect(getByTestId('empty_followers_message')).toBeTruthy();
    expect(getByText(message)).toBeTruthy();
  });

  it('should render empty string message', () => {
    const { getByTestId } = renderWithTheme(<EmptyFollowersState message="" />);

    expect(getByTestId('empty_followers_state')).toBeTruthy();
  });

  it('should render long message', () => {
    const longMessage = 'This is a very long message about no followers';
    const { getByText } = renderWithTheme(<EmptyFollowersState message={longMessage} />);

    expect(getByText(longMessage)).toBeTruthy();
  });
});
