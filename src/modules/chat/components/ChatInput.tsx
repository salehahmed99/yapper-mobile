import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { uploadMessageImage, uploadVoiceNote } from '@/src/modules/chat/services/chatService';
import { IReplyContext } from '@/src/modules/chat/types';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import { Image as ImageIcon, Mic, Send, Trash2, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: (imageUrl?: string | null, voiceNoteUrl?: string | null, voiceNoteDuration?: string | null) => void;
  placeholder?: string;
  style?: ViewStyle;
  replyingTo?: IReplyContext | null;
  onCancelReply?: () => void;
}

export default function ChatInput({
  value,
  onChangeText,
  onSend,
  placeholder = 'Start a new message',
  style,
  replyingTo,
  onCancelReply,
}: ChatInputProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Voice recording state
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [voicePreviewUri, setVoicePreviewUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | number | null>(null);

  // Recording timer
  useEffect(() => {
    if (recorderState.isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recorderState.isRecording]);

  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Error', message);
    }
  };

  const handleSend = () => {
    if (value.trim() || uploadedImageUrl) {
      onSend(uploadedImageUrl, null, null);
      setPreviewUri(null);
      setUploadedImageUrl(null);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setPreviewUri(imageUri);
      setIsUploading(true);

      try {
        const uploadResult = await uploadMessageImage(imageUri);
        setUploadedImageUrl(uploadResult.imageUrl);
      } catch {
        showToast('Failed to upload image. Please try again.');
        setPreviewUri(null);
        setUploadedImageUrl(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Configure audio mode for recording on mount
  useEffect(() => {
    const configureAudioMode = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch (error) {
        console.warn('Failed to configure audio mode:', error);
      }
    };
    configureAudioMode();
  }, []);

  const handleStartRecording = async () => {
    try {
      // Configure audio mode for iOS
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow access to your microphone.');
        return;
      }
      setRecordingDuration(0);
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      console.error('Failed to start recording:', error);
      showToast('Failed to start recording. Please try again.');
    }
  };

  const handleStopRecording = async () => {
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (uri) {
        setVoicePreviewUri(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      showToast('Failed to stop recording. Please try again.');
    }
  };

  const handleVoiceNote = () => {
    if (recorderState.isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const handleDeleteVoiceNote = () => {
    setVoicePreviewUri(null);
    setRecordingDuration(0);
  };

  const handleSendVoiceNote = async () => {
    if (!voicePreviewUri) return;

    setIsUploadingVoice(true);
    try {
      const uploadResult = await uploadVoiceNote(voicePreviewUri, recordingDuration);

      onSend(null, uploadResult.voiceNoteUrl, uploadResult.duration);
      setVoicePreviewUri(null);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Failed to upload voice note:', error);
      showToast('Failed to send voice note. Please try again.');
    } finally {
      setIsUploadingVoice(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUri(null);
    setUploadedImageUrl(null);
  };

  const canSend = (value.trim() || uploadedImageUrl) && !isUploading;
  const isRecording = recorderState.isRecording;
  const hasVoicePreview = !!voicePreviewUri;

  return (
    <View style={[styles.container, style]} testID="chat_input_container">
      {replyingTo && (
        <View style={styles.replyBanner}>
          <View style={styles.replyBannerContent}>
            <Text style={styles.replyBannerLabel}>Replying to {replyingTo.senderName}</Text>
            <View style={styles.replyRow}>
              {replyingTo.hasImage && <ImageIcon size={14} color={theme.colors.text.secondary} />}
              {replyingTo.hasVoice && <Mic size={14} color={theme.colors.text.secondary} />}
              <Text
                style={[
                  styles.replyBannerText,
                  styles.replyBannerTextFlex,
                  (replyingTo.hasImage || replyingTo.hasVoice) && styles.replyBannerTextWithPadding,
                ]}
                numberOfLines={1}
              >
                {replyingTo.hasVoice && !replyingTo.content
                  ? 'Voice message'
                  : replyingTo.hasImage && !replyingTo.content
                    ? 'Photo'
                    : replyingTo.content}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.replyBannerClose} onPress={onCancelReply}>
            <X color={theme.colors.text.secondary} size={20} />
          </TouchableOpacity>
        </View>
      )}
      {previewUri && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: previewUri }} style={styles.imagePreview} />
          {isUploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="small" color={theme.colors.text.inverse} />
            </View>
          )}
          <TouchableOpacity style={styles.removeImageButton} onPress={handleRemoveImage}>
            <X color={theme.colors.text.inverse} size={16} />
          </TouchableOpacity>
        </View>
      )}
      {/* Voice Recording UI */}
      {isRecording && (
        <View style={styles.recordingBanner}>
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording...</Text>
          </View>
          <Text style={styles.recordingTimer}>{formatRecordingTime(recordingDuration)}</Text>
          <TouchableOpacity style={styles.stopRecordingButton} onPress={handleVoiceNote}>
            <Text style={styles.stopRecordingText}>Stop</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Voice Preview UI */}
      {hasVoicePreview && !isRecording && (
        <View style={styles.voicePreviewBanner}>
          <View style={styles.voicePreviewInfo}>
            <Mic size={20} color={theme.colors.accent.bookmark} />
            <Text style={styles.voicePreviewText}>Voice message ({formatRecordingTime(recordingDuration)})</Text>
          </View>
          <View style={styles.voicePreviewActions}>
            <TouchableOpacity
              style={styles.voicePreviewDelete}
              onPress={handleDeleteVoiceNote}
              disabled={isUploadingVoice}
            >
              <Trash2 size={20} color={theme.colors.error} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.voicePreviewSend} onPress={handleSendVoiceNote} disabled={isUploadingVoice}>
              {isUploadingVoice ? (
                <ActivityIndicator size="small" color={theme.colors.text.inverse} />
              ) : (
                <Send size={18} color={theme.colors.text.inverse} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Regular Input Row - hide when recording or has voice preview */}
      {!isRecording && !hasVoicePreview && (
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={handlePickImage}
            disabled={isUploading}
            testID="chat_input_image_button"
            accessibilityLabel={t('messages.input.pickImage')}
            accessibilityRole="button"
          >
            <ImageIcon color={isUploading ? theme.colors.text.secondary : theme.colors.accent.bookmark} size={24} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor={theme.colors.text.secondary}
              value={value}
              onChangeText={onChangeText}
              multiline
              maxLength={300}
              testID="chat_input_text_field"
              accessibilityLabel={t('messages.input.messageInput')}
            />
          </View>
          <TouchableOpacity
            style={[styles.mediaButton, isRecording && styles.recordingButton]}
            onPress={handleVoiceNote}
            testID="chat_input_voice_button"
            accessibilityLabel={t('messages.input.voiceNote')}
            accessibilityRole="button"
          >
            <Mic color={isRecording ? theme.colors.text.inverse : theme.colors.accent.bookmark} size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!canSend}
            testID="chat_input_send_button"
            accessibilityLabel={t('messages.input.sendMessage')}
            accessibilityRole="button"
          >
            <Send color={canSend ? theme.colors.text.inverse : theme.colors.text.secondary} size={20} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background.primary,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    inputWrapper: {
      flex: 1,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.xl,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      maxHeight: 100,
    },
    input: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text.primary,
      padding: 0,
      minHeight: 20,
    },
    mediaButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    recordingButton: {
      backgroundColor: theme.colors.accent.bookmark,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.accent.bookmark,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: theme.colors.background.secondary,
    },
    replyBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.background.secondary,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.accent.bookmark,
    },
    replyBannerContent: {
      flex: 1,
    },
    replyBannerLabel: {
      fontSize: theme.typography.sizes.xs,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.accent.bookmark,
      marginBottom: 2,
    },
    replyBannerText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
    },
    replyBannerClose: {
      padding: theme.spacing.xs,
    },
    imagePreviewContainer: {
      padding: theme.spacing.md,
      paddingBottom: 0,
    },
    imagePreview: {
      width: 120,
      height: 120,
      borderRadius: theme.borderRadius.md,
    },
    uploadingOverlay: {
      position: 'absolute',
      top: theme.spacing.md,
      left: theme.spacing.md,
      width: 120,
      height: 120,
      borderRadius: theme.borderRadius.md,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeImageButton: {
      position: 'absolute',
      top: theme.spacing.lg,
      left: theme.spacing.lg,
      width: theme.spacing.xxl,
      height: theme.spacing.xxl,
      borderRadius: theme.borderRadius.xxl,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Voice Recording Styles
    recordingBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.error + '15',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.error + '30',
    },
    recordingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    recordingDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.error,
    },
    recordingText: {
      color: theme.colors.error,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.medium,
    },
    recordingTimer: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.bold,
    },
    stopRecordingButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.error,
      borderRadius: theme.borderRadius.md,
    },
    stopRecordingText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.semiBold,
    },
    // Voice Preview Styles
    voicePreviewBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.accent.bookmark + '15',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.accent.bookmark + '30',
    },
    voicePreviewInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    voicePreviewText: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.medium,
    },
    voicePreviewActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    voicePreviewDelete: {
      padding: theme.spacing.sm,
    },
    voicePreviewSend: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.accent.bookmark,
      justifyContent: 'center',
      alignItems: 'center',
    },
    replyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    replyBannerTextFlex: {
      flex: 1,
    },
    replyBannerTextWithPadding: {
      paddingEnd: theme.spacing.sm,
    },
  });
