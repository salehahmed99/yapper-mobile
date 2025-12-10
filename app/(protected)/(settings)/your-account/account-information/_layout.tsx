import { Stack } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
export default function AccountInformationLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: theme.colors.background.primary },
      }}
    />
  );
}
