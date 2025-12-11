import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { uploadMessageImage } from '@/src/modules/chat/services/chatService';
import { IReplyContext } from '@/src/modules/chat/types';
import * as ImagePicker from 'expo-image-picker';
import { Image as ImageIcon, Mic, Send, X } from 'lucide-react-native';
import React, { useState } from 'react';
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
  onSend: (imageUrl?: string | null) => void;
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
  const [isRecording, setIsRecording] = useState(false);

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Error', message);
    }
  };

  const handleSend = () => {
    if (value.trim() || uploadedImageUrl) {
      onSend(uploadedImageUrl);
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

  const handleVoiceNote = () => {
    setIsRecording(!isRecording);
    Alert.alert('Coming Soon', 'Voice notes will be available soon!');
  };

  const handleRemoveImage = () => {
    setPreviewUri(null);
    setUploadedImageUrl(null);
  };

  const canSend = (value.trim() || uploadedImageUrl) && !isUploading;

  return (
    <View style={[styles.container, style]} testID="chat_input_container">
      {replyingTo && (
        <View style={styles.replyBanner}>
          <View style={styles.replyBannerContent}>
            <Text style={styles.replyBannerLabel}>Replying to {replyingTo.senderName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {replyingTo.hasImage && <ImageIcon size={14} color={theme.colors.text.secondary} />}
              <Text
                style={[styles.replyBannerText, { flex: 1, paddingEnd: replyingTo.hasImage ? theme.spacing.sm : 0 }]}
                numberOfLines={1}
              >
                {replyingTo.hasImage && !replyingTo.content ? 'Photo' : replyingTo.content}
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
            maxLength={1000}
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
  });
