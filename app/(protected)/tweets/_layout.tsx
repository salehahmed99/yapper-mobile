import { Stack } from 'expo-router';
import React from 'react';

const TweetsLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="create-post" options={{ presentation: 'modal' }} />
    </Stack>
  );
};

export default TweetsLayout;
