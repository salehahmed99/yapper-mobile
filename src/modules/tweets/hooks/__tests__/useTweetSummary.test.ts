import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import { useTweetSummary } from '../useTweetSummary';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('../../services/tweetService', () => ({
  getTweetSummary: jest.fn(),
}));

describe('useTweetSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockImplementation(() => ({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    }));
  });

  it('should call useQuery with correct queryKey', () => {
    renderHook(() => useTweetSummary('tweet123'));

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['tweetSummary', { tweetId: 'tweet123' }],
      }),
    );
  });

  it('should set enabled to true when tweetId is provided', () => {
    renderHook(() => useTweetSummary('tweet456'));

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
      }),
    );
  });

  it('should set enabled to false when tweetId is undefined', () => {
    renderHook(() => useTweetSummary());

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      }),
    );
  });

  it('should set retry to 2', () => {
    renderHook(() => useTweetSummary('tweet789'));

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        retry: 2,
      }),
    );
  });

  it('should set stale time to 5 minutes', () => {
    renderHook(() => useTweetSummary('tweet000'));

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        staleTime: 5 * 60 * 1000,
      }),
    );
  });

  it('should call getTweetSummary with tweetId', () => {
    const { getTweetSummary } = require('../../services/tweetService');

    renderHook(() => useTweetSummary('tweet111'));

    const config = (useQuery as jest.Mock).mock.calls[0][0];
    config.queryFn();

    expect(getTweetSummary).toHaveBeenCalledWith('tweet111');
  });

  it('should return query result', () => {
    const mockResult = {
      data: { id: 'tweet123', text: 'Hello' },
      isLoading: false,
      isError: false,
      error: null,
    };

    (useQuery as jest.Mock).mockReturnValue(mockResult);

    const { result } = renderHook(() => useTweetSummary('tweet222'));

    expect(result.current).toBe(mockResult);
  });

  it('should handle empty tweetId', () => {
    renderHook(() => useTweetSummary(''));

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      }),
    );
  });
});
