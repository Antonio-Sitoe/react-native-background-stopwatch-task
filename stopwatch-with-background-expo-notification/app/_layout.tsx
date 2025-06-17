import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useTimerStore, setupNotificationHandlers } from '@/stores/timerStore';
import * as Notifications from 'expo-notifications';

let i = 0;
// Configure notification handler
Notifications.setNotificationHandler({
  // @ts-ignore
  handleNotification: async () => ({
    priority: Notifications.AndroidNotificationPriority.HIGH,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowList: false,
  }),
});

export default function RootLayout() {
  useFrameworkReady();

  const loadPersistedState = useTimerStore((state) => state.loadPersistedState);

  useEffect(() => {
    // Request notification permissions on app start
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
      }
    };

    // Setup notification categories
    const setupNotificationCategories = async () => {
      try {
        await Notifications.setNotificationCategoryAsync('timer_actions', [
          {
            identifier: 'pause',
            buttonTitle: '⏸️ Pause',
            options: { opensAppToForeground: false },
          },
          {
            identifier: 'resume',
            buttonTitle: '▶️ Resume',
            options: { opensAppToForeground: false },
          },
          {
            identifier: 'stop',
            buttonTitle: '⏹️ Stop',
            options: { opensAppToForeground: false },
          },
        ]);
      } catch (error) {
        console.error('Error setting up notification categories:', error);
      }
    };

    const initialize = async () => {
      await requestPermissions();
      await setupNotificationCategories();
      await loadPersistedState();
    };

    initialize();

    // Setup notification handlers and native module
    const cleanup = setupNotificationHandlers();

    return cleanup;
  }, [loadPersistedState]);

  console.log('RODOU UMA VEZ', i++);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
