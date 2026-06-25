import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type NotificationPermissionResult = {
  granted: boolean;
  message?: string;
};

export type ExpoPushTokenResult = {
  token: string | null;
  message?: string;
};

export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function ensureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('default', {
    name: 'Notifications',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function requestNotificationPermission(): Promise<NotificationPermissionResult> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    if (existingStatus === 'granted') {
      return { granted: true };
    }

    const { status } = await Notifications.requestPermissionsAsync();

    if (status === 'granted') {
      return { granted: true };
    }

    return {
      granted: false,
      message:
        'Les notifications ont été refusées. Vous pouvez les activer dans les réglages de votre appareil.',
    };
  } catch {
    return {
      granted: false,
      message: 'Impossible de demander la permission de notification.',
    };
  }
}

export async function getExpoPushToken(): Promise<ExpoPushTokenResult> {
  if (!Device.isDevice) {
    return { token: null };
  }

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

    const tokenData = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    return { token: tokenData.data };
  } catch (error) {
    if (__DEV__) {
      const detail = error instanceof Error ? error.message : 'Erreur inconnue.';
      console.warn('[notifications] Push token unavailable:', detail);
    }
    return { token: null };
  }
}

export async function sendLocalNotification(title: string, body: string): Promise<void> {
  await ensureAndroidNotificationChannel();

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: null,
  });
}
