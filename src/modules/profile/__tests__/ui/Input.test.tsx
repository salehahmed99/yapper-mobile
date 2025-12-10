import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from '../../../../context/ThemeContext';
import Input from '../../ui/Input';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('../../../../hooks/useRTL', () => ({
  useRTL: () => false,
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Input', () => {
  const mockSetValue = jest.fn();

  beforeEach(() => {
    mockSetValue.mockClear();
  });

  it('should render with label and value', () => {
    const { getByText, getByDisplayValue } = renderWithTheme(
      <Input label="Name" value="John Doe" setValue={mockSetValue} />,
    );

    expect(getByText('Name')).toBeTruthy();
    expect(getByDisplayValue('John Doe')).toBeTruthy();
  });

  it('should call setValue when text changes', () => {
    const { getByDisplayValue } = renderWithTheme(<Input label="Bio" value="Initial value" setValue={mockSetValue} />);

    fireEvent.changeText(getByDisplayValue('Initial value'), 'New value');

    expect(mockSetValue).toHaveBeenCalledWith('New value');
  });

  it('should render with placeholder', () => {
    const { getByPlaceholderText } = renderWithTheme(
      <Input label="Email" value="" setValue={mockSetValue} placeholder="Enter email" />,
    );

    expect(getByPlaceholderText('Enter email')).toBeTruthy();
  });

  it('should render as multiline when specified', () => {
    const { getByDisplayValue } = renderWithTheme(
      <Input label="Description" value="Multi-line text" setValue={mockSetValue} multiline={true} />,
    );

    const input = getByDisplayValue('Multi-line text');
    expect(input.props.multiline).toBe(true);
  });

  it('should pass numberOfLines prop', () => {
    const { getByDisplayValue } = renderWithTheme(
      <Input label="Bio" value="Text" setValue={mockSetValue} multiline={true} numberOfLines={5} />,
    );

    const input = getByDisplayValue('Text');
    expect(input.props.numberOfLines).toBe(5);
  });

  it('should use custom placeholder text color', () => {
    const { getByDisplayValue } = renderWithTheme(
      <Input label="Name" value="Test" setValue={mockSetValue} placeholderTextColor="#FF0000" />,
    );

    const input = getByDisplayValue('Test');
    expect(input.props.placeholderTextColor).toBe('#FF0000');
  });

  it('should render with testID', () => {
    const { getByTestId } = renderWithTheme(
      <Input label="Test Input" value="" setValue={mockSetValue} testID="custom-input" />,
    );

    expect(getByTestId('custom-input')).toBeTruthy();
    expect(getByTestId('custom-input_field')).toBeTruthy();
  });

  it('should render with custom styles', () => {
    const customStyle = { marginBottom: 20 };
    const customInputStyle = { fontSize: 18 };

    const { getByTestId } = renderWithTheme(
      <Input
        label="Styled Input"
        value="Value"
        setValue={mockSetValue}
        style={customStyle}
        inputStyle={customInputStyle}
        testID="styled-input"
      />,
    );

    expect(getByTestId('styled-input')).toBeTruthy();
  });

  it('should handle empty value', () => {
    const { getByTestId } = renderWithTheme(
      <Input label="Empty" value="" setValue={mockSetValue} testID="empty-input" />,
    );

    expect(getByTestId('empty-input_field')).toBeTruthy();
  });
});
