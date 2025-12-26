import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { IUser } from '@/src/types/user';
import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DEFAULT_AVATAR_URI } from '../../profile/utils/edit-profile.utils';
import { formatTweetDate } from '../../tweets/utils/formatTweetDate';

interface INotificationProps {
  users: IUser[];
  createdAt: string;
  title: string;
  body?: string;
  icon: React.ReactNode;
  onPress: () => void;
  onAvatarPress: (userId: string) => void;
}
const Notification: React.FC<INotificationProps> = (props) => {
  const { users, createdAt, title, body, icon, onPress, onAvatarPress } = props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      accessibilityLabel="notification_item"
      testID="notification_item"
    >
      <View accessibilityLabel="notification_icon" testID="notification_icon">
        {icon}
      </View>
      <View style={styles.detailsColumn}>
        <View style={styles.headerRow}>
          <View style={styles.avatarsContainer} accessibilityLabel="notification_avatars_container">
            {users.map((user, index) => (
              <Pressable
                key={user.id}
                onPress={() => onAvatarPress(user.id)}
                accessibilityLabel={`notification_avatar_${index}`}
                testID={`notification_avatar_${index}`}
              >
                <Image
                  source={user.avatarUrl ? { uri: user.avatarUrl } : DEFAULT_AVATAR_URI}
                  style={styles.avatar}
                  cachePolicy="memory-disk"
                  accessibilityLabel={`avatar_image_${user.username}`}
                />
              </Pressable>
            ))}
          </View>
          <Text style={styles.timestamp} accessibilityLabel="notification_timestamp" testID="notification_timestamp">
            {createdAt && formatTweetDate(createdAt)}
          </Text>
        </View>
        <Text style={styles.title} accessibilityLabel="notification_title" testID="notification_title">
          {title}
        </Text>
        {body && (
          <Text style={styles.body} accessibilityLabel="notification_body" testID="notification_body">
            {body}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

export default Notification;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    detailsColumn: {
      flex: 1,
      flexDirection: 'column',
      gap: theme.spacing.xs,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    avatarsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: -theme.spacing.xs,
    },
    avatar: {
      width: theme.avatarSizes.sm,
      height: theme.avatarSizes.sm,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.secondary,
      borderWidth: 2,
      borderColor: theme.colors.background.primary,
    },
    timestamp: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.secondary,
    },
    title: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.semiBold,
      color: theme.colors.text.primary,
    },
    body: {
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.secondary,
    },
  });
