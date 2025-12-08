import { Stack } from 'expo-router';

export default function AccountInformationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#000000' },
      }}
    />
  );
}
