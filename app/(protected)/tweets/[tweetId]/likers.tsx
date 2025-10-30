import { useTheme } from '@/src/context/ThemeContext';
import UserList from '@/src/modules/user_list/components/UserList';
import { IUser } from '@/src/types/user';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LikersScreen() {
  const { tweetId } = useLocalSearchParams<{ tweetId: string }>();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const handleUserPress = (_user: IUser) => {
    // Navigate to user profile
    // TODO: Implement navigation to user profile
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Stack.Screen
        options={{
          title: t('tweetActivity.likedBy'),
        }}
      />
      <UserList tweetId={tweetId} type="likes" onUserPress={handleUserPress} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
