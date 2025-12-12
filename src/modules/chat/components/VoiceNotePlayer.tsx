import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Mic, Pause, Play } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface VoiceNotePlayerProps {
  voiceNoteUrl: string;
  voiceNoteDuration?: number | string | null;
  isOwn: boolean;
}

export default function VoiceNotePlayer({ voiceNoteUrl, voiceNoteDuration, isOwn }: VoiceNotePlayerProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme, isOwn);

  // Configure audio mode for iOS playback
  useEffect(() => {
    const configureAudio = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
        });
      } catch (error) {
        console.warn('Failed to configure audio mode:', error);
      }
    };

    if (Platform.OS === 'ios') {
      configureAudio();
    }
  }, []);

  // Use simple URL for the player
  const player = useAudioPlayer(voiceNoteUrl);
  const playerStatus = useAudioPlayerStatus(player);

  const isLoaded = playerStatus?.isLoaded ?? false;
  const [loadTimeout, setLoadTimeout] = React.useState(false);

  // Timeout for iOS
  useEffect(() => {
    if (Platform.OS === 'ios' && !isLoaded) {
      // After 2 seconds, stop showing loading indicator even if not loaded
      const timer = setTimeout(() => {
        setLoadTimeout(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [voiceNoteUrl, isLoaded]);

  // Defensive checks for all status properties
  const isPlaying = playerStatus?.playing ?? false;
  const currentTime = playerStatus?.currentTime ?? 0;
  const duration = playerStatus?.duration ?? 0;
  const playbackProgress = duration > 0 ? currentTime / duration : 0;

  // Show loading if not loaded yet, but only up to 2 seconds on iOS
  const isLoading = !isLoaded && !isPlaying && !loadTimeout;

  const formatDuration = (value: number | string | null | undefined): string => {
    if (value == null) return '0:00';
    if (typeof value === 'string') return value;
    const mins = Math.floor(value / 60);
    const secs = Math.floor(value % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      player.pause();
    } else {
      // Reset to start if finished
      if (currentTime >= duration && duration > 0) {
        player.seekTo(0);
      }
      player.play();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
        {isLoading ? (
          <ActivityIndicator size="small" color={styles.playButtonIconColor} />
        ) : isPlaying ? (
          <Pause size={20} color={styles.playButtonIconColor} fill={styles.playButtonIconColor} />
        ) : (
          <Play size={20} color={styles.playButtonIconColor} fill={styles.playButtonIconColor} />
        )}
      </TouchableOpacity>

      <View style={styles.waveformContainer}>
        <View style={styles.waveform}>
          <View style={[styles.progress, { width: `${playbackProgress * 100}%` }]} />
        </View>
        <Text style={styles.duration}>
          {isPlaying ? formatDuration(currentTime) : formatDuration(voiceNoteDuration)}
        </Text>
      </View>

      <Mic size={16} color={isOwn ? theme.colors.text.inverse : theme.colors.text.primary} style={styles.micIcon} />
    </View>
  );
}

const createStyles = (theme: Theme, isOwn: boolean) => {
  const iconColor = isOwn ? theme.colors.accent.bookmark : theme.colors.text.inverse;

  return {
    ...StyleSheet.create({
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        minWidth: 180,
      },
      playButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isOwn ? theme.colors.text.inverse : theme.colors.accent.bookmark,
      },
      waveformContainer: {
        flex: 1,
      },
      waveform: {
        height: 4,
        backgroundColor: isOwn ? theme.colors.text.inverse + '44' : theme.colors.text.primary + '44',
        borderRadius: 2,
        overflow: 'hidden',
      },
      progress: {
        height: '100%',
        backgroundColor: isOwn ? theme.colors.text.inverse : theme.colors.accent.bookmark,
      },
      duration: {
        fontSize: theme.typography.sizes.xs,
        color: isOwn ? theme.colors.text.inverse : theme.colors.text.secondary,
        marginTop: 4,
      },
      micIcon: {
        opacity: 0.8,
      },
    }),
    playButtonIconColor: iconColor,
  };
};
