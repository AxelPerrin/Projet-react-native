import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/providers/AuthProvider';
import {
  getExpoPushToken,
  requestNotificationPermission,
  sendLocalNotification,
} from '@/services/notifications';
import { upsertExpoPushToken } from '@/services/profile';

interface UseNotificationsResult {
  status: string | null;
  isTesting: boolean;
  testNotification: () => Promise<void>;
}

export function useNotifications(): UseNotificationsResult {
  const { user } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setStatus(null);
      return;
    }

    const userId = user.id;
    let cancelled = false;

    async function setupNotifications() {
      try {
        const permission = await requestNotificationPermission();

        if (cancelled) {
          return;
        }

        if (!permission.granted) {
          setStatus(permission.message ?? 'Les notifications sont désactivées.');
          return;
        }

        setStatus('Notifications autorisées.');

        const { token } = await getExpoPushToken();

        if (cancelled) {
          return;
        }

        if (token) {
          try {
            await upsertExpoPushToken(userId, token);
          } catch {
            if (__DEV__) {
              console.warn('[notifications] Failed to save push token to profile.');
            }
          }
        }
      } catch {
        if (!cancelled) {
          setStatus('Impossible de configurer les notifications.');
        }
      }
    }

    setupNotifications();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const testNotification = useCallback(async () => {
    setIsTesting(true);

    try {
      const permission = await requestNotificationPermission();

      if (!permission.granted) {
        Alert.alert(
          'Notifications',
          permission.message ?? 'Les notifications sont désactivées.',
        );
        return;
      }

      await sendLocalNotification('Rappel', 'Ceci est une notification de test.');
    } catch {
      Alert.alert('Erreur', "Impossible d'envoyer la notification de test.");
    } finally {
      setIsTesting(false);
    }
  }, []);

  return {
    status,
    isTesting,
    testNotification,
  };
}
