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

const NOTE_REMINDER_PREFIX = 'studyflow-note-';

export function getNoteReminderIdentifier(noteId: string): string {
  return `${NOTE_REMINDER_PREFIX}${noteId}`;
}

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getReminderDate(dueDateIso: string): Date | null {
  const due = startOfDay(new Date(dueDateIso.includes('T') ? dueDateIso : `${dueDateIso}T00:00:00`));
  if (Number.isNaN(due.getTime())) {
    return null;
  }

  const dayBefore = new Date(due);
  dayBefore.setDate(dayBefore.getDate() - 1);
  dayBefore.setHours(9, 0, 0, 0);

  const now = new Date();
  if (dayBefore > now) {
    return dayBefore;
  }

  const morningOf = new Date(due);
  morningOf.setHours(9, 0, 0, 0);
  if (morningOf > now) {
    return morningOf;
  }

  return null;
}

export async function cancelNoteReminder(noteId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(getNoteReminderIdentifier(noteId));
  } catch {
    if (__DEV__) {
      console.warn('[notifications] Failed to cancel reminder for note:', noteId);
    }
  }
}

export async function scheduleNoteReminder(
  noteId: string,
  title: string,
  dueDateIso: string,
  completed: boolean,
): Promise<void> {
  await cancelNoteReminder(noteId);

  if (completed || !dueDateIso) {
    return;
  }

  const reminderDate = getReminderDate(dueDateIso);
  if (!reminderDate) {
    return;
  }

  const permission = await requestNotificationPermission();
  if (!permission.granted) {
    return;
  }

  await ensureAndroidNotificationChannel();

  const due = startOfDay(new Date(dueDateIso.includes('T') ? dueDateIso : `${dueDateIso}T00:00:00`));
  const dueLabel = due.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  await Notifications.scheduleNotificationAsync({
    identifier: getNoteReminderIdentifier(noteId),
    content: {
      title: 'StudyFlow — Rappel',
      body: `« ${title} » est à rendre le ${dueLabel}.`,
      data: { noteId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
  });
}
