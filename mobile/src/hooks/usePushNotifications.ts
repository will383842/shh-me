/**
 * Registers for push notifications via expo-notifications.
 * Saves device token and handles foreground notification display.
 */
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { apiRequest } from '../services/api';
import { useAuthStore } from '../stores/useAuthStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotifications(): Promise<string | null> {
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
}

export function usePushNotifications(): void {
  const token = useAuthStore((s) => s.token);
  const notificationListener =
    useRef<Notifications.EventSubscription | null>(null);
  const responseListener =
    useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!token) return;

    void registerForPushNotifications().then(async (pushToken) => {
      if (pushToken) {
        try {
          await apiRequest('/user/push-token', {
            method: 'PUT',
            body: { push_token: pushToken },
            token,
          });
        } catch {
          // Will retry on next app open
        }
      }
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener(() => {
        // Foreground notification received — handled by setNotificationHandler
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(() => {
        // User tapped notification — navigation handled by deep link
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [token]);
}
