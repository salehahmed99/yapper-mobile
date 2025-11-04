import FollowButton from '@/src/modules/user_list/components/FollowButton';
import { IUser } from '@/src/types/user';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Theme } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';
import { useAuthStore } from '../../../store/useAuthStore';
import UserList from '../../user_list/components/UserList';
import { ProfileUserListType } from '../../user_list/types';
import CustomTabView, { TabConfig } from './CustomTabView';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.colors.background.primary },
  });

interface UserListRouteProps {
  type: ProfileUserListType;
  userId?: string;
}

const UserListRoute = ({ type, userId }: UserListRouteProps) => {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const currentUser = useAuthStore((state) => state.user);

  // Use the passed userId, or fallback to current user's ID
  const targetUserId = userId || currentUser?.id;

  const handleUserPress = (user: IUser) => {
    // Navigate to the user's profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push(`/(profile)/${user.id}` as any);
  };

  const handleFollowPress = (_user: IUser) => {
    // Handle follow/unfollow logic here
  };

  if (!targetUserId) {
    return <View style={styles.page} />;
  }

  return (
    <View style={styles.page}>
      <UserList
        type={type}
        userId={targetUserId}
        onUserPress={handleUserPress}
        renderAction={(user) => <FollowButton user={user} onPress={handleFollowPress} />}
      />
    </View>
  );
};

const FollowingRoute = ({ userId }: { userId?: string }) => <UserListRoute type="following" userId={userId} />;
const FollowersRoute = ({ userId }: { userId?: string }) => <UserListRoute type="followers" userId={userId} />;

interface ListsComponentProps {
  initialTab?: string;
  userId?: string;
}

export default function ListsComponent({ initialTab, userId }: ListsComponentProps) {
  const { t } = useTranslation();
  const tabs: TabConfig[] = [
    { key: 'Following', title: t('profile.following'), component: () => <FollowingRoute userId={userId} /> },
    { key: 'Followers', title: t('profile.followers'), component: () => <FollowersRoute userId={userId} /> },
  ];

  return <CustomTabView tabs={tabs} initialTab={initialTab} />;
}
