import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ActionButton from '../../ui/ActionButton';

describe('ActionButton', () => {
  it('should render with title', () => {
    const { getByText } = render(<ActionButton title="Test Button" />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<ActionButton title="Press Me" onPress={onPress} />);

    fireEvent.press(getByText('Press Me'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should render with custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const customTextStyle = { color: 'blue' };

    const { getByText } = render(
      <ActionButton title="Styled Button" style={customStyle} textStyle={customTextStyle} />,
    );

    expect(getByText('Styled Button')).toBeTruthy();
  });

  it('should render with testID', () => {
    const { getByTestId } = render(<ActionButton title="Test" testID="action-button-test" />);
    expect(getByTestId('action-button-test')).toBeTruthy();
  });

  it('should have accessibility label', () => {
    const { getByLabelText } = render(<ActionButton title="Accessible Button" />);
    expect(getByLabelText('action_button_accessible_button')).toBeTruthy();
  });

  it('should use custom testID for accessibility label if provided', () => {
    const { getByLabelText } = render(<ActionButton title="Test" testID="custom-id" />);
    expect(getByLabelText('custom-id')).toBeTruthy();
  });

  it('should handle titles with spaces in accessibility label', () => {
    const { getByLabelText } = render(<ActionButton title="My Action Button" />);
    expect(getByLabelText('action_button_my_action_button')).toBeTruthy();
  });

  it('should render without onPress handler', () => {
    const { getByText } = render(<ActionButton title="No Handler" />);
    expect(getByText('No Handler')).toBeTruthy();
  });
});
