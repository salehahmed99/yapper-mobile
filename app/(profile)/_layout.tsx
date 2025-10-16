import { Stack } from "expo-router";
import React from "react";
import { useTheme } from "../../src/context/ThemeContext";

export default function ProfileLayout() {
  const { theme } = useTheme();
  
  // TODO: Replace with actual username from user store/context
  // Example: const { user } = useAuthStore(); const username = user?.name || "User";
  const username = "Pixsellz";

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: theme.colors.background.primary,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Profile",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Lists"
        options={{
          title: username,
          headerShown: true,
          headerBackTitle: "",
          headerStyle: {
            backgroundColor: theme.colors.background.primary,
          },
          headerTintColor: theme.colors.text.primary,
          headerTitleStyle: {
            color: theme.colors.text.primary,
            fontWeight: "700",
            fontSize: 18,
          },
          headerShadowVisible: true,
        }}
      />
    </Stack>
  );
}
