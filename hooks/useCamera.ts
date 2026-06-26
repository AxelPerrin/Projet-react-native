import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import * as cameraService from '@/services/camera';
import * as profileService from '@/services/profile';

interface UseCameraResult {
  photoUri: string | null;
  loading: boolean;
  error: string | null;
  isCapturing: boolean;
  takePhoto: () => Promise<void>;
}

export function useCamera(userId: string | undefined): UseCameraResult {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (!userId) {
      setPhotoUri(null);
      setLoading(false);
      return;
    }

    const currentUserId = userId;
    let cancelled = false;

    async function loadPhoto() {
      setLoading(true);
      setError(null);

      try {
        const savedUri = await profileService.fetchProfileAvatarUrl(currentUserId);
        if (!cancelled) {
          setPhotoUri(savedUri);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Impossible de charger la photo.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPhoto();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const takePhoto = useCallback(async () => {
    if (!userId) {
      return;
    }

    setIsCapturing(true);
    setError(null);

    try {
      const result = await cameraService.launchCamera();

      if (result.message && !result.uri) {
        Alert.alert('Caméra', result.message);
        setError(result.message);
        return;
      }

      if (!result.uri) {
        return;
      }

      const avatarUrl = await profileService.uploadProfileAvatar(userId, result.uri);
      setPhotoUri(avatarUrl);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Impossible de prendre une photo.';
      setError(message);
      Alert.alert('Erreur', message);
    } finally {
      setIsCapturing(false);
    }
  }, [userId]);

  return {
    photoUri,
    loading,
    error,
    isCapturing,
    takePhoto,
  };
}
