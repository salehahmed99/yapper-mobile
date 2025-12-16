import Page from '@/app/[...all]';
import { render, waitFor } from '@testing-library/react-native';
import React from 'react';

describe('[...all] Page', () => {
  it('should redirect to 404', async () => {
    render(<Page />);
    await waitFor(() => {
      expect(global.mockReplace).toHaveBeenCalledWith('/404');
    });
  });
});
