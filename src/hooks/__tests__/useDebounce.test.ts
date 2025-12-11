import { act, renderHook } from '@testing-library/react-native';
import useDebounce from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));

    expect(result.current).toBe('initial');
  });

  it('should not update the value before the delay', () => {
    const { result, rerender } = renderHook(({ value }: { value: string }) => useDebounce(value, 300), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated' });

    // Before the delay, value should still be 'initial'
    expect(result.current).toBe('initial');

    // Advance time by less than delay
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe('initial');
  });

  it('should update the value after the delay', () => {
    const { result, rerender } = renderHook(({ value }: { value: string }) => useDebounce(value, 300), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated' });

    // Advance time past the delay
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });

  it('should reset the timer on rapid value changes', () => {
    const { result, rerender } = renderHook(({ value }: { value: string }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    });

    // Simulate rapid typing
    rerender({ value: 'ab' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'abc' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'abcd' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Still should be 'a' because timer keeps resetting
    expect(result.current).toBe('a');

    // Now wait for full delay after last change
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('abcd');
  });

  it('should use default delay of 300ms when not specified', () => {
    const { result, rerender } = renderHook(({ value }: { value: string }) => useDebounce(value), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated' });

    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });

  it('should work with different types', () => {
    const { result, rerender } = renderHook(({ value }: { value: number }) => useDebounce(value, 300), {
      initialProps: { value: 42 },
    });

    rerender({ value: 100 });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe(100);
  });
});
