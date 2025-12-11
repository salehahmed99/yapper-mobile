import { useNotifications } from '@/src/modules/notifications/hooks/useNotifications';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NotificationsScreen = () => {
  const notificationsQuery = useNotifications();

  const notifications = notificationsQuery.data?.pages?.flatMap((page) => page.notifications) || [];

  if (notificationsQuery.isLoading) {
    return <Text>Loading...</Text>;
  }

  if (notificationsQuery.isError) {
    return <Text>Error: {notificationsQuery.error.message}</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlashList
        data={notifications}
        renderItem={({ item }) => <Text>{item.type}</Text>}
        keyExtractor={(item) => item.created_at}
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
