import { useNavigation } from '@/src/hooks/useNavigation';
import FollowButton from '@/src/modules/user_list/components/FollowButton';
import { IUser } from '@/src/types/user';
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
  const { navigate } = useNavigation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const currentUser = useAuthStore((state) => state.user);

  const targetUserId = userId || currentUser?.id;

  const handleUserPress = (user: IUser) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigate(`/(profile)/${user.id}` as any);
  };

  const handleFollowPress = (_user: IUser) => {};

  if (!targetUserId) {
    return <View style={styles.page} testID={`user_list_route_${type}_no_user`} />;
  }

  return (
    <View style={styles.page} testID={`user_list_route_${type}`}>
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
const MutualFollowersRoute = ({ userId }: { userId?: string }) => (
  <UserListRoute type="mutualFollowers" userId={userId} />
);

interface ListsComponentProps {
  initialTab?: string;
  userId?: string;
}

export default function ListsComponent({ initialTab, userId }: ListsComponentProps) {
  const { t } = useTranslation();
  const currentUser = useAuthStore((state) => state.user);
  const isOwnProfile = !userId || userId === currentUser?.id;

  const tabs: TabConfig[] = [
    { key: 'Following', title: t('profile.lists.following'), component: () => <FollowingRoute userId={userId} /> },
    { key: 'Followers', title: t('profile.lists.followers'), component: () => <FollowersRoute userId={userId} /> },
  ];

  if (!isOwnProfile) {
    tabs.push({
      key: 'MutualFollowers',
      title: t('profile.lists.followersYouKnow'),
      component: () => <MutualFollowersRoute userId={userId} />,
    });
  }

  return <CustomTabView tabs={tabs} initialTab={initialTab} scrollEnabled={!isOwnProfile} />;
}
