import { ThemeProvider } from '@/src/context/ThemeContext';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ReplyRestrictionSelector from '../../components/ReplyRestrictionSelector';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ReplyRestrictionSelector', () => {
  it('should render correctly with Everyone option', () => {
    const { getByText } = renderWithTheme(<ReplyRestrictionSelector onPress={() => {}} selectedOption="Everyone" />);
    expect(getByText('Everyone can reply')).toBeTruthy();
  });

  it('should render correctly with Verified accounts option', () => {
    const { getByText } = renderWithTheme(
      <ReplyRestrictionSelector onPress={() => {}} selectedOption="Verified accounts" />,
    );
    expect(getByText('Verified accounts can reply')).toBeTruthy();
  });

  it('should handle press', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithTheme(<ReplyRestrictionSelector onPress={onPress} selectedOption="Everyone" />);

    fireEvent.press(getByTestId('create_post_reply_restriction_selector'));
    expect(onPress).toHaveBeenCalled();
  });
});
