import { useSocketConnection } from '@/src/hooks/useSocketConnection';
import { socketService } from '@/src/services/socketService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { renderHook } from '@testing-library/react-native';
import { AppState, AppStateStatus } from 'react-native';

// Mock dependencies
jest.mock('@/src/services/socketService', () => ({
  socketService: {
    connect: jest.fn(),
    disconnect: jest.fn(),
  },
}));

jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

describe('useSocketConnection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(AppState, 'currentState', {
      get: jest.fn(() => 'active'),
      configurable: true,
    });
  });

  it('should connect when initialized and authenticated', () => {
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ isInitialized: true, user: { id: '1' } }),
    );

    renderHook(() => useSocketConnection());

    expect(socketService.connect).toHaveBeenCalled();
  });

  it('should NOT connect when not initialized', () => {
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ isInitialized: false, user: { id: '1' } }),
    );

    renderHook(() => useSocketConnection());

    expect(socketService.connect).not.toHaveBeenCalled();
  });

  it('should NOT connect when not authenticated', () => {
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ isInitialized: true, user: null }),
    );

    renderHook(() => useSocketConnection());

    expect(socketService.connect).not.toHaveBeenCalled();
  });

  it('should disconnect when user logs out', () => {
    // Start authenticated
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ isInitialized: true, user: { id: '1' } }),
    );
    const { rerender } = renderHook(() => useSocketConnection());
    expect(socketService.connect).toHaveBeenCalled();

    // Logout (user becomes null)
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ isInitialized: true, user: null }),
    );
    rerender({});

    expect(socketService.disconnect).toHaveBeenCalled();
  });

  it('should disconnect on unmount', () => {
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ isInitialized: true, user: { id: '1' } }),
    );

    const { unmount } = renderHook(() => useSocketConnection());

    unmount();

    expect(socketService.disconnect).toHaveBeenCalled();
  });

  // AppState testing is tricky with mocks, but we can try spying on addEventListener
  it('should handle app state changes', () => {
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ isInitialized: true, user: { id: '1' } }),
    );

    // Mock AppState.addEventListener
    let listener: (state: AppStateStatus) => void;
    jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation((_type: string, handler: (state: AppStateStatus) => void) => {
        listener = handler;
        return { remove: jest.fn() } as unknown as import('react-native').NativeEventSubscription;
      });

    renderHook(() => useSocketConnection());

    // Initially active
    expect(socketService.connect).toHaveBeenCalledTimes(1);

    // Simulate background
    listener!('background');
    expect(socketService.disconnect).toHaveBeenCalled();

    // Simulate active
    listener!('active');
    expect(socketService.connect).toHaveBeenCalledTimes(2);
  });
});
