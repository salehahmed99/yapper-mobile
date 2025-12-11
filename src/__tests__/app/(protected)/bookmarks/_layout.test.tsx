import BookmarksLayout from '@/app/(protected)/bookmarks/_layout';
import { render } from '@testing-library/react-native';
import React from 'react';

// Mocks
jest.mock('expo-router', () => ({
  Stack: jest.fn(() => null),
}));

describe('BookmarksLayout', () => {
  it('should render Stack', () => {
    render(<BookmarksLayout />);
    const { Stack } = require('expo-router');
    expect(Stack).toHaveBeenCalled();
  });
});
