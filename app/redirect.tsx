import ActivityLoader from '@/src/components/ActivityLoader';
import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function RedirectScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ActivityLoader visible={true} message="Completing sign in..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
