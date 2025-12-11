import Page from '@/app/[...all]';
import { render, waitFor } from '@testing-library/react-native';
import React from 'react';

// Mocks
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

describe('[...all] Page', () => {
  it('should redirect to 404', async () => {
    render(<Page />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/404');
    });
  });
});
