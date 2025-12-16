import { act, renderHook } from '@testing-library/react-native';
import { useVideoStore } from '../useVideoStore';

describe('useVideoStore', () => {
  beforeEach(() => {
    useVideoStore.setState({ isMuted: true });
  });

  describe('initial state', () => {
    it('should have videos muted by default', () => {
      const { result } = renderHook(() => useVideoStore());

      expect(result.current.isMuted).toBe(true);
    });
  });

  describe('toggleMute', () => {
    it('should toggle mute from true to false', () => {
      const { result } = renderHook(() => useVideoStore());

      expect(result.current.isMuted).toBe(true);

      act(() => {
        result.current.toggleMute();
      });

      expect(result.current.isMuted).toBe(false);
    });

    it('should toggle mute from false to true', () => {
      const { result } = renderHook(() => useVideoStore());

      act(() => {
        result.current.setMuted(false);
      });

      expect(result.current.isMuted).toBe(false);

      act(() => {
        result.current.toggleMute();
      });

      expect(result.current.isMuted).toBe(true);
    });

    it('should toggle multiple times correctly', () => {
      const { result } = renderHook(() => useVideoStore());

      act(() => {
        result.current.toggleMute(); // true -> false
        result.current.toggleMute(); // false -> true
        result.current.toggleMute(); // true -> false
      });

      expect(result.current.isMuted).toBe(false);
    });

    it('should toggle back to original state', () => {
      const { result } = renderHook(() => useVideoStore());
      const initialState = result.current.isMuted;

      act(() => {
        result.current.toggleMute();
        result.current.toggleMute();
      });

      expect(result.current.isMuted).toBe(initialState);
    });
  });

  describe('setMuted', () => {
    it('should set muted to true', () => {
      const { result } = renderHook(() => useVideoStore());

      act(() => {
        result.current.setMuted(true);
      });

      expect(result.current.isMuted).toBe(true);
    });

    it('should set muted to false', () => {
      const { result } = renderHook(() => useVideoStore());

      act(() => {
        result.current.setMuted(false);
      });

      expect(result.current.isMuted).toBe(false);
    });

    it('should update from muted to unmuted', () => {
      const { result } = renderHook(() => useVideoStore());

      expect(result.current.isMuted).toBe(true);

      act(() => {
        result.current.setMuted(false);
      });

      expect(result.current.isMuted).toBe(false);
    });

    it('should update from unmuted to muted', () => {
      const { result } = renderHook(() => useVideoStore());

      act(() => {
        result.current.setMuted(false);
      });

      expect(result.current.isMuted).toBe(false);

      act(() => {
        result.current.setMuted(true);
      });

      expect(result.current.isMuted).toBe(true);
    });

    it('should handle setting to same value', () => {
      const { result } = renderHook(() => useVideoStore());

      act(() => {
        result.current.setMuted(true);
        result.current.setMuted(true);
      });

      expect(result.current.isMuted).toBe(true);
    });
  });

  describe('combined operations', () => {
    it('should work correctly after toggle', () => {
      const { result } = renderHook(() => useVideoStore());

      act(() => {
        result.current.toggleMute();
      });

      expect(result.current.isMuted).toBe(false);

      act(() => {
        result.current.setMuted(true);
      });

      expect(result.current.isMuted).toBe(true);
    });

    it('should work correctly after setMuted', () => {
      const { result } = renderHook(() => useVideoStore());

      act(() => {
        result.current.setMuted(false);
      });

      expect(result.current.isMuted).toBe(false);

      act(() => {
        result.current.toggleMute();
      });

      expect(result.current.isMuted).toBe(true);
    });

    it('should maintain state across hooks', () => {
      const { result: result1 } = renderHook(() => useVideoStore());
      const { result: result2 } = renderHook(() => useVideoStore());

      act(() => {
        result1.current.setMuted(false);
      });

      expect(result2.current.isMuted).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid toggles', () => {
      const { result } = renderHook(() => useVideoStore());

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.toggleMute();
        }
      });

      // 100 toggles from true should end at true
      expect(result.current.isMuted).toBe(true);
    });

    it('should handle rapid setMuted calls', () => {
      const { result } = renderHook(() => useVideoStore());

      act(() => {
        for (let i = 0; i < 50; i++) {
          result.current.setMuted(i % 2 === 0);
        }
      });

      expect(result.current.isMuted).toBe(false); // i=49, 49 % 2 === 1, so false
    });

    it('should maintain boolean type', () => {
      const { result } = renderHook(() => useVideoStore());

      act(() => {
        result.current.setMuted(true);
        result.current.toggleMute();
      });

      expect(typeof result.current.isMuted).toBe('boolean');
    });
  });
});
