import { ThemeProvider } from '@/src/context/ThemeContext';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { View } from 'react-native';
import TweetActionButton from '../../components/TweetActionButton';

// Mock Icon
const MockIcon = (props: any) => <View testID="mock-icon" {...props} />;

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('TweetActionButton', () => {
  it('should render correctly with count', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <TweetActionButton icon={MockIcon} count={100} accessibilityLabel="like" testID="like-button" size="small" />,
    );

    expect(getByText('100')).toBeTruthy();
    expect(getByTestId('like-button')).toBeTruthy();
  });

  it('should render correctly without count', () => {
    const { queryByText, getByTestId } = renderWithTheme(
      <TweetActionButton icon={MockIcon} accessibilityLabel="like" testID="like-button" size="small" />,
    );

    expect(queryByText('100')).toBeNull();
    expect(getByTestId('like-button')).toBeTruthy();
  });

  it('should handle press', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithTheme(
      <TweetActionButton
        icon={MockIcon}
        count={100}
        onPress={onPress}
        accessibilityLabel="like"
        testID="like-button"
        size="small"
      />,
    );

    fireEvent.press(getByTestId('like-button'));
    expect(onPress).toHaveBeenCalled();
  });
});
