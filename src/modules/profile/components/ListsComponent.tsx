import CustomTabView from '@/src/components/CustomTabView';
import { useNavigation } from '@/src/hooks/useNavigation';
import { useSwipeableTabsGeneric } from '@/src/hooks/useSwipeableTabsGeneric';
import FollowButton from '@/src/modules/user_list/components/FollowButton';
import { IUser } from '@/src/types/user';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, View } from 'react-native';
import { Theme } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';
import { useAuthStore } from '../../../store/useAuthStore';
import UserList from '../../user_list/components/UserList';
import { ProfileUserListType } from '../../user_list/types';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.colors.background.primary },
    tabsOuterContainer: {
      flex: 1,
      overflow: 'hidden',
    },
    tabsInnerContainer: {
      flex: 1,
      flexDirection: 'row',
    },
    tabPage: {
      flex: 1,
    },
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
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const currentUser = useAuthStore((state) => state.user);
  const isOwnProfile = !userId || userId === currentUser?.id;

  const routes = useMemo(() => {
    const base = [
      { key: 'Following', title: t('profile.lists.following') },
      { key: 'Followers', title: t('profile.lists.followers') },
    ];
    if (!isOwnProfile) {
      base.push({
        key: 'MutualFollowers',
        title: t('profile.lists.followersYouKnow'),
      });
    }
    return base;
  }, [t, isOwnProfile]);

  const getInitialIndex = () => {
    if (initialTab) {
      const index = routes.findIndex((route) => route.key.toLowerCase() === initialTab.toLowerCase());
      return index !== -1 ? index : 0;
    }
    return 0;
  };

  const [activeIndex, setActiveIndex] = useState(getInitialIndex());

  const { translateX, panResponder, screenWidth } = useSwipeableTabsGeneric({
    tabCount: routes.length,
    currentIndex: activeIndex,
    onIndexChange: setActiveIndex,
    swipeEnabled: true,
  });

  return (
    <>
      <CustomTabView routes={routes} index={activeIndex} onIndexChange={setActiveIndex} scrollable={false} />
      <View style={styles.tabsOuterContainer} {...panResponder.panHandlers}>
        <Animated.View
          style={[styles.tabsInnerContainer, { width: screenWidth * routes.length, transform: [{ translateX }] }]}
        >
          <View style={[styles.tabPage, { width: screenWidth }]}>
            <FollowingRoute userId={userId} />
          </View>
          <View style={[styles.tabPage, { width: screenWidth }]}>
            <FollowersRoute userId={userId} />
          </View>
          {!isOwnProfile && (
            <View style={[styles.tabPage, { width: screenWidth }]}>
              <MutualFollowersRoute userId={userId} />
            </View>
          )}
        </Animated.View>
      </View>
    </>
  );
}
