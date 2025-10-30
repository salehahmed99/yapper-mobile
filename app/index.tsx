import React, { useEffect } from 'react';
import { useAuthStore } from '@/src/store/useAuthStore';
import { router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { StyleSheet } from 'react-native';

export default function App() {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (token === null) {
      router.replace('/(auth)/landing_screen');
    } else {
      router.replace('/(protected)');
    }
  }, [token]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
