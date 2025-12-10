import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function YourAccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'android' ? 'slide_from_right' : 'default',
      }}
    />
  );
}
