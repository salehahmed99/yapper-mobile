import { UiShellProvider, useUiShell } from '@/src/context/UiShellContext';
import { act, renderHook } from '@testing-library/react-native';
import React from 'react';

describe('UiShellContext', () => {
  it('should provide default values', () => {
    const { result } = renderHook(() => useUiShell(), {
      wrapper: ({ children }: { children: React.ReactNode }) => <UiShellProvider>{children}</UiShellProvider>,
    });

    expect(result.current.isSideMenuOpen).toBe(false);
  });

  it('should toggle side menu', () => {
    const { result } = renderHook(() => useUiShell(), {
      wrapper: ({ children }: { children: React.ReactNode }) => <UiShellProvider>{children}</UiShellProvider>,
    });

    act(() => {
      result.current.openSideMenu();
    });
    expect(result.current.isSideMenuOpen).toBe(true);

    act(() => {
      result.current.closeSideMenu();
    });
    expect(result.current.isSideMenuOpen).toBe(false);

    act(() => {
      result.current.toggleSideMenu();
    });
    expect(result.current.isSideMenuOpen).toBe(true);
  });
});
