import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import IconButton from '../../ui/IconButton';

describe('IconButton', () => {
  it('should render children correctly', () => {
    const { getByText } = render(
      <IconButton>
        <Text>Icon</Text>
      </IconButton>,
    );

    expect(getByText('Icon')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <IconButton onPress={onPress} testID="icon-btn">
        <Text>X</Text>
      </IconButton>,
    );

    fireEvent.press(getByTestId('icon-btn'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should render with custom styles', () => {
    const customStyle = { backgroundColor: 'blue' };

    const { getByTestId } = render(
      <IconButton style={customStyle} testID="styled-icon-btn">
        <Text>+</Text>
      </IconButton>,
    );

    expect(getByTestId('styled-icon-btn')).toBeTruthy();
  });

  it('should render with testID', () => {
    const { getByTestId } = render(
      <IconButton testID="test-icon-button">
        <Text>Test</Text>
      </IconButton>,
    );

    expect(getByTestId('test-icon-button')).toBeTruthy();
  });

  it('should have correct accessibility label when testID is provided', () => {
    const { getByLabelText } = render(
      <IconButton testID="custom-icon">
        <Text>Icon</Text>
      </IconButton>,
    );

    expect(getByLabelText('custom-icon')).toBeTruthy();
  });

  it('should have default accessibility label when testID is not provided', () => {
    const { getByLabelText } = render(
      <IconButton>
        <Text>Icon</Text>
      </IconButton>,
    );

    expect(getByLabelText('icon_button')).toBeTruthy();
  });

  it('should have button accessibility role', () => {
    const { getByRole } = render(
      <IconButton>
        <Text>Button</Text>
      </IconButton>,
    );

    expect(getByRole('button')).toBeTruthy();
  });

  it('should render without onPress handler', () => {
    const { getByText } = render(
      <IconButton>
        <Text>No Handler</Text>
      </IconButton>,
    );

    expect(getByText('No Handler')).toBeTruthy();
  });
});
