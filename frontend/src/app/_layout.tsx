import { router, Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    const checkUserId = async () => {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        // Redirect to Login if no user is logged in
        router.replace('/Login');
      }
    };

    checkUserId();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" />
        <Stack.Screen name="(user)" />
        <Stack.Screen name="(driver)" />
      </Stack>
    </GestureHandlerRootView>
  );
}
