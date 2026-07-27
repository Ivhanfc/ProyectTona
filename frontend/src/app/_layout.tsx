import { Stack, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

// AUTH BYPASS TOGGLES FOR DEVELOPER UI TESTING
export const FORCE_USER_VIEW = false;   // Set to true to force user navigation stack
export const FORCE_DRIVER_VIEW = true; // Set to true to force driver navigation stack

// Si clickeas continue sin llenar los campos te va a mandar al que sea true aqui, no importa si seleccionas customer o driver, si uno de esos esta true te manda directamente a esa vista Ivancito

export default function RootLayout() {
  useEffect(() => {
    const handleInitialRedirect = async () => {
      // 1. Check Developer Toggles
      if (FORCE_USER_VIEW && !FORCE_DRIVER_VIEW) {
        router.replace('/(user)');
        return;
      }
      if (FORCE_DRIVER_VIEW && !FORCE_USER_VIEW) {
        router.replace('/(driver)');
        return;
      }

      // 2. Standard Auth Flow
      try {
        const userId = await AsyncStorage.getItem('user_id');
        const userRole = await AsyncStorage.getItem('user_role');
        if (!userId) {
          router.replace('/Login');
        } else {
          router.replace(userRole === 'driver' ? '/(driver)' : '/(user)');
        }
      } catch (error) {
        console.error('Error during initial redirect:', error);
        router.replace('/Login');
      }
    };

    handleInitialRedirect();
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
