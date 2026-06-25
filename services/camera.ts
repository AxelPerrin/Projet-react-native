import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

import { getErrorMessage } from '@/lib/errors';

const PHOTO_KEY_PREFIX = 'profile_photo:';

export type CameraPermissionResult = {
  granted: boolean;
  message?: string;
};

export type CameraCaptureResult = {
  uri: string | null;
  message?: string;
};

function getStorageKey(userId: string): string {
  return `${PHOTO_KEY_PREFIX}${userId}`;
}

export async function requestCameraPermission(): Promise<CameraPermissionResult> {
  try {
    const { status: existingStatus } = await ImagePicker.getCameraPermissionsAsync();

    if (existingStatus === 'granted') {
      return { granted: true };
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status === 'granted') {
      return { granted: true };
    }

    return {
      granted: false,
      message:
        'L’accès à la caméra a été refusé. Vous pouvez l’activer dans les réglages de votre appareil.',
    };
  } catch (error) {
    return {
      granted: false,
      message: getErrorMessage(error, 'Impossible de demander la permission caméra.'),
    };
  }
}

export async function launchCamera(): Promise<CameraCaptureResult> {
  try {
    const permission = await requestCameraPermission();

    if (!permission.granted) {
      return { uri: null, message: permission.message };
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return { uri: null };
    }

    return { uri: result.assets[0].uri };
  } catch (error) {
    return {
      uri: null,
      message: getErrorMessage(error, 'Impossible d’ouvrir la caméra.'),
    };
  }
}

export async function getSavedPhotoUri(userId: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(getStorageKey(userId));
  } catch {
    return null;
  }
}

export async function savePhotoUri(userId: string, uri: string): Promise<void> {
  await AsyncStorage.setItem(getStorageKey(userId), uri);
}

export async function clearSavedPhotoUri(userId: string): Promise<void> {
  await AsyncStorage.removeItem(getStorageKey(userId));
}
