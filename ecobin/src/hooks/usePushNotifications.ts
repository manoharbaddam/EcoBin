import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications(userId: string | undefined) {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#166534',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      try {
        const projectId = process.env.EXPO_PUBLIC_PROJECT_ID || 'a103cd4e-a50a-4818-8041-ce0083bcde4c';
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
        })).data;
      } catch (e) {
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: 'a103cd4e-a50a-4818-8041-ce0083bcde4c'
        })).data;
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    // Also get the underlying true FCM/APNs token for Firebase Admin use
    let deviceToken;
    try {
      deviceToken = (await Notifications.getDevicePushTokenAsync()).data;
    } catch (e) {
      console.log('Failed to get device device token', e);
    }

    return { token, deviceToken };
  }

  useEffect(() => {
    if (!userId) return;

    registerForPushNotificationsAsync().then(async (tokens) => {
      if (!tokens) return;
      setExpoPushToken(tokens.token);
      if (tokens.token && userId) {
        try {
          await updateDoc(doc(db, 'users', userId), {
            expoPushToken: tokens.token,
            fcmToken: tokens.deviceToken || tokens.token, // Fallback to expo token if device token fails, though backend might complain
          });
        } catch (e) {
          console.error("Error saving push token:", e);
        }
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
    });

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, [userId]);

  return { expoPushToken, notification };
}
