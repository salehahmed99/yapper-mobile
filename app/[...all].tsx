import { useNavigation } from '@/src/hooks/useNavigation';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function Page() {
  const { replace } = useNavigation();

  useEffect(() => {
    // Redirect unknown routes to the 404 page
    replace('/404');
  }, [replace]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
