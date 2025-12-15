import { AUTOPLAY_DELAY, VIDEO_UPDATE_INTERVAL } from '@/src/modules/tweets/constants/mediaViewer';
import { PlaybackSpeed } from '@/src/modules/tweets/types/mediaViewer';
import { useVideoPlayer, VideoPlayer } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, View } from 'react-native';

type UseMediaViewerControlsProps = {
  videoSource: string | null;
  isVideo: boolean;
  initialTime?: number;
  shouldAutoplay?: boolean;
};

type UseMediaViewerControlsReturn = {
  player: VideoPlayer;
  currentTime: number;
  duration: number;
  isMuted: boolean;
  playbackSpeed: PlaybackSpeed;
  showSpeedMenu: boolean;
  isSeeking: boolean;
  progressBarRef: React.RefObject<View | null>;
  togglePlayPause: () => void;
  toggleMute: () => void;
  handleSpeedChange: (speed: PlaybackSpeed) => void;
  setShowSpeedMenu: (show: boolean) => void;
  formatTime: (timeInSeconds: number) => string;
  handleSeek: (locationX: number, width: number) => void;
  handleProgressBarPress: (event: GestureResponderEvent) => void;
  onProgressBarTouchStart: (event: GestureResponderEvent) => void;
  onProgressBarTouchMove: (event: GestureResponderEvent) => void;
  onProgressBarTouchEnd: () => void;
};

export function useMediaViewerControls({
  videoSource,
  isVideo,
  initialTime,
  shouldAutoplay = true,
}: UseMediaViewerControlsProps): UseMediaViewerControlsReturn {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const progressBarRef = useRef<View>(null);

  // Create video player
  const player = useVideoPlayer(videoSource || '', (player) => {
    if (videoSource) {
      player.loop = true;
      player.muted = isMuted;
      player.playbackRate = playbackSpeed;
    }
  });

  // Autoplay video when initialized
  useEffect(() => {
    if (!player || !videoSource || !isVideo || !shouldAutoplay) return;

    const timeoutId = setTimeout(() => {
      try {
        if (initialTime && !isNaN(initialTime) && initialTime > 0) {
          player.currentTime = initialTime;
        }
        player.play();
      } catch (error) {
        console.warn('Error playing video:', error);
      }
    }, AUTOPLAY_DELAY);

    return () => clearTimeout(timeoutId);
  }, [player, videoSource, isVideo, initialTime, shouldAutoplay]);

  // Update video time and duration periodically
  useEffect(() => {
    if (!player || !videoSource || !isVideo) return;

    const interval = setInterval(() => {
      try {
        if (player && videoSource) {
          setCurrentTime(player.currentTime);
          setDuration(player.duration);
        }
      } catch {
        clearInterval(interval);
      }
    }, VIDEO_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [player, videoSource, isVideo]);

  // Sync mute state with player
  useEffect(() => {
    if (player && videoSource && isVideo) {
      try {
        player.muted = isMuted;
      } catch (error) {
        console.warn('Error setting mute:', error);
      }
    }
  }, [isMuted, player, videoSource, isVideo]);

  // Sync playback speed with player
  useEffect(() => {
    if (player && videoSource && isVideo) {
      try {
        player.playbackRate = playbackSpeed;
      } catch (error) {
        console.warn('Error setting playback speed:', error);
      }
    }
  }, [playbackSpeed, player, videoSource, isVideo]);

  const togglePlayPause = () => {
    if (!player || !videoSource || !isVideo) return;

    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSpeedChange = (speed: PlaybackSpeed) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const formatTime = (timeInSeconds: number) => {
    // Show placeholder if time is invalid (NaN, Infinity, negative, or 0 for duration)
    if (!Number.isFinite(timeInSeconds) || timeInSeconds < 0) {
      return '--:--';
    }
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const handleSeek = (locationX: number, width: number) => {
    if (duration === 0 || !player || !videoSource || !isVideo) return;

    const percentage = Math.max(0, Math.min(1, locationX / width));
    const newTime = Math.max(0, Math.min(percentage * duration, duration - 0.1));

    player.currentTime = newTime;
  };

  const handleProgressBarPress = (event: GestureResponderEvent) => {
    if (duration === 0 || !progressBarRef.current) return;

    progressBarRef.current.measure((x, y, width) => {
      const { locationX } = event.nativeEvent;
      handleSeek(locationX, width);
    });
  };

  const onProgressBarTouchStart = (_event: GestureResponderEvent) => {
    if (duration > 0) {
      setIsSeeking(true);
    }
  };

  const onProgressBarTouchMove = (event: GestureResponderEvent) => {
    if (!isSeeking || !progressBarRef.current || duration === 0) return;

    progressBarRef.current.measure((x, y, width, _height, pageX) => {
      const touchX = event.nativeEvent.pageX - pageX;
      handleSeek(touchX, width);
    });
  };

  const onProgressBarTouchEnd = () => {
    setIsSeeking(false);
  };

  return {
    player,
    currentTime,
    duration,
    isMuted,
    playbackSpeed,
    showSpeedMenu,
    isSeeking,
    progressBarRef,
    togglePlayPause,
    toggleMute,
    handleSpeedChange,
    setShowSpeedMenu,
    formatTime,
    handleSeek,
    handleProgressBarPress,
    onProgressBarTouchStart,
    onProgressBarTouchMove,
    onProgressBarTouchEnd,
  };
}
