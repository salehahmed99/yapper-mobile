import useNavigation from '@/src/hooks/useNavigation';
import { renderHook } from '@testing-library/react-native';
import { useLocalSearchParams, useSegments } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { useTweetActions } from '../useTweetActions';
import useTweetUtils from '../useTweetUtils';

// Mock dependencies
jest.mock('../useTweetActions');
jest.mock('@/src/hooks/useNavigation');
jest.mock('expo-router');
jest.mock('react-i18next');
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

describe('useTweetUtils', () => {
  const mockMutate = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useTweetActions as jest.Mock).mockReturnValue({
      likeMutation: { mutate: mockMutate },
      repostMutation: { mutate: mockMutate },
      replyToPostMutation: { mutate: mockMutate },
      quotePostMutation: { mutate: mockMutate },
      bookmarkMutation: { mutate: mockMutate },
      deletePostMutation: { mutate: mockMutate },
    });

    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });

    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'user123' });
    (useSegments as jest.Mock).mockReturnValue(['(protected)', '(profile)']);
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
    });
  });

  it('should return all handler functions', () => {
    const { result } = renderHook(() => useTweetUtils());

    expect(result.current).toHaveProperty('handleDeletePress');
    expect(result.current).toHaveProperty('handleAvatarPress');
    expect(result.current).toHaveProperty('handleReply');
    expect(result.current).toHaveProperty('handleQuote');
    expect(result.current).toHaveProperty('handleRepost');
    expect(result.current).toHaveProperty('handleLike');
    expect(result.current).toHaveProperty('handleBookmark');
    expect(result.current).toHaveProperty('handleViewPostInteractions');
    expect(result.current).toHaveProperty('handleShare');
    expect(result.current).toHaveProperty('handleMentionPress');
    expect(result.current).toHaveProperty('handleHashtagPress');
  });

  it('should call likeMutation with correct parameters', () => {
    const { result } = renderHook(() => useTweetUtils());

    result.current.handleLike('tweet123', true);

    expect(mockMutate).toHaveBeenCalledWith({
      tweetId: 'tweet123',
      isLiked: true,
    });
  });

  it('should call repostMutation with correct parameters', () => {
    const { result } = renderHook(() => useTweetUtils());

    result.current.handleRepost('tweet456', false);

    expect(mockMutate).toHaveBeenCalledWith({
      tweetId: 'tweet456',
      isReposted: false,
    });
  });

  it('should call bookmarkMutation with correct parameters', () => {
    const { result } = renderHook(() => useTweetUtils());

    result.current.handleBookmark('tweet789', true);

    expect(mockMutate).toHaveBeenCalledWith({
      tweetId: 'tweet789',
      isBookmarked: true,
    });
  });

  it('should call replyToPostMutation with text content', () => {
    const { result } = renderHook(() => useTweetUtils());

    result.current.handleReply('tweet123', 'Great post!');

    expect(mockMutate).toHaveBeenCalledWith({
      tweetId: 'tweet123',
      content: 'Great post!',
      mediaUris: undefined,
    });
  });

  it('should call replyToPostMutation with media', () => {
    const { result } = renderHook(() => useTweetUtils());

    const mediaUris = ['uri://image1', 'uri://image2'];
    result.current.handleReply('tweet123', 'Check this out', mediaUris);

    expect(mockMutate).toHaveBeenCalledWith({
      tweetId: 'tweet123',
      content: 'Check this out',
      mediaUris: mediaUris,
    });
  });

  it('should call quotePostMutation with correct parameters', () => {
    const { result } = renderHook(() => useTweetUtils());

    result.current.handleQuote('tweet123', 'My quote', ['uri://image']);

    expect(mockMutate).toHaveBeenCalledWith({
      tweetId: 'tweet123',
      content: 'My quote',
      mediaUris: ['uri://image'],
    });
  });

  it('should show delete confirmation alert', () => {
    const { result } = renderHook(() => useTweetUtils());

    result.current.handleDeletePress('tweet123');

    expect(Alert.alert).toHaveBeenCalledWith(
      'tweets.deleteConfirmation.title',
      'tweets.deleteConfirmation.message',
      expect.any(Array),
    );
  });

  it('should navigate to mention profile', () => {
    const { result } = renderHook(() => useTweetUtils());

    result.current.handleMentionPress('john_doe');

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/(protected)/(profile)/[id]',
      params: { id: 'john_doe' },
    });
  });

  it('should navigate to hashtag search', () => {
    const { result } = renderHook(() => useTweetUtils());

    result.current.handleHashtagPress('#typescript');

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/(protected)/search/search-results',
      params: { query: '#typescript' },
    });
  });

  it('should navigate to user profile when avatar is pressed', () => {
    const { result } = renderHook(() => useTweetUtils());

    result.current.handleAvatarPress('differentUser123');

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/(protected)/(profile)/[id]',
      params: { id: 'differentUser123' },
    });
  });

  it('should not navigate when avatar is current profile', () => {
    const { result } = renderHook(() => useTweetUtils());

    result.current.handleAvatarPress('user123'); // Same as params.id

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should navigate to post interactions', () => {
    const { result } = renderHook(() => useTweetUtils());

    result.current.handleViewPostInteractions('tweet123', 'owner456');

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/(protected)/tweets/[tweetId]/activity',
      params: {
        tweetId: 'tweet123',
        ownerId: 'owner456',
      },
    });
  });

  it('should handle share (currently noop)', () => {
    const { result } = renderHook(() => useTweetUtils());

    expect(() => result.current.handleShare()).not.toThrow();
  });

  it('should handle delete through alert confirmation', () => {
    const { result } = renderHook(() => useTweetUtils());

    result.current.handleDeletePress('tweet123');

    // Get the delete button from the alert
    const alertCalls = (Alert.alert as jest.Mock).mock.calls[0];
    const buttons = alertCalls[2] as any[];
    const deleteButton = buttons.find((btn) => btn.text === 'tweets.deleteConfirmation.delete');

    deleteButton?.onPress?.();

    expect(mockMutate).toHaveBeenCalledWith({ tweetId: 'tweet123' });
  });
});
