import { Stack } from 'expo-router';

export default function AccessibilityDisplayLanguagesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
