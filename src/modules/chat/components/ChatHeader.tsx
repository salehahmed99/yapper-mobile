import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useRTL } from '@/src/hooks/useRTL';
import { ArrowLeft, Info } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ChatHeaderProps {
  name: string;
  username: string;
  avatarUrl?: string;
  onBack: () => void;
  onInfo?: () => void;
}

export default function ChatHeader({ name, username, avatarUrl, onBack, onInfo }: ChatHeaderProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const isRTL = useRTL();

  return (
    <View style={styles.container} testID="chat_header_container">
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        testID="chat_header_back_button"
        accessibilityLabel={t('messages.header.goBack')}
        accessibilityRole="button"
      >
        <ArrowLeft
          color={theme.colors.text.primary}
          style={isRTL ? { transform: [{ rotate: '180deg' }] } : undefined}
          size={24}
        />
      </TouchableOpacity>
      <View style={styles.userInfo}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>{name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.textInfo}>
          <Text style={styles.name} numberOfLines={1} testID="chat_header_name">
            {name}
          </Text>
          <Text style={styles.username} numberOfLines={1}>
            @{username}
          </Text>
        </View>
      </View>
      {onInfo && (
        <TouchableOpacity
          style={styles.infoButton}
          onPress={onInfo}
          testID="chat_header_info_button"
          accessibilityLabel={t('messages.header.chatInfo')}
          accessibilityRole="button"
        >
          <Info color={theme.colors.text.primary} size={24} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: theme.spacing.sm,
    },
    backButton: {
      padding: theme.spacing.xs,
    },
    userInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    avatarPlaceholder: {
      backgroundColor: theme.colors.accent.bookmark,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.background.primary,
    },
    textInfo: {
      flex: 1,
    },
    name: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
      textAlign: 'left',
    },
    username: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
      textAlign: 'left',
    },
    infoButton: {
      padding: theme.spacing.xs,
    },
  });
