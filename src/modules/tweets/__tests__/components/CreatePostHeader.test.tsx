import { ThemeProvider } from '@/src/context/ThemeContext';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import CreatePostHeader from '../../components/CreatePostHeader';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('CreatePostHeader', () => {
  it('should render correctly', () => {
    const { getByText } = renderWithTheme(
      <CreatePostHeader canPost={false} handleCancel={() => {}} handlePost={() => {}} />,
    );
    expect(getByText('Cancel')).toBeTruthy();
    expect(getByText('Post')).toBeTruthy();
  });

  it('should handle cancel press', () => {
    const handleCancel = jest.fn();
    const { getByTestId } = renderWithTheme(
      <CreatePostHeader canPost={false} handleCancel={handleCancel} handlePost={() => {}} />,
    );

    fireEvent.press(getByTestId('create_post_button_cancel'));
    expect(handleCancel).toHaveBeenCalled();
  });

  it('should handle post press when enabled', () => {
    const handlePost = jest.fn();
    const { getByTestId } = renderWithTheme(
      <CreatePostHeader canPost={true} handleCancel={() => {}} handlePost={handlePost} />,
    );

    fireEvent.press(getByTestId('create_post_button_post'));
    expect(handlePost).toHaveBeenCalled();
  });

  it('should not handle post press when disabled', () => {
    const handlePost = jest.fn();
    const { getByTestId } = renderWithTheme(
      <CreatePostHeader canPost={false} handleCancel={() => {}} handlePost={handlePost} />,
    );

    fireEvent.press(getByTestId('create_post_button_post'));
    expect(handlePost).not.toHaveBeenCalled();
  });
});
