import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useAuthStore } from '../../../store/useAuthStore';
import ListsComponent from '../components/ListsComponent';
import { createContainerStyles } from '../styles/container-style';

export default function ListsContainer() {
  const { tab, userId, username } = useLocalSearchParams<{
    tab?: string;
    userId?: string;
    username?: string;
  }>();
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);

  const tabValue = Array.isArray(tab) ? tab[0] : tab;
  const userIdValue = Array.isArray(userId) ? userId[0] : userId;
  const usernameValue = Array.isArray(username) ? username[0] : username;

  const { theme } = useTheme();
  const containerStyles = useMemo(() => createContainerStyles(theme), [theme]);

  useEffect(() => {
    const displayName = usernameValue || user?.name || 'User';
    navigation.setOptions({
      title: displayName,
    });
  }, [usernameValue, user?.name, navigation]);

  return (
    <View style={containerStyles.container}>
      <ListsComponent initialTab={tabValue} userId={userIdValue} />
    </View>
  );
}
