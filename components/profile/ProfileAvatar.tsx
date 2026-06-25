import { memo } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { commonStyles, theme } from '@/lib/theme';

interface ProfileAvatarProps {
  photoUri: string | null;
  loading: boolean;
  error: string | null;
  isCapturing: boolean;
  onTakePhoto: () => void;
}

function ProfileAvatarComponent({
  photoUri,
  loading,
  error,
  isCapturing,
  onTakePhoto,
}: ProfileAvatarProps) {
  const avatarSize = theme.sizes.avatarSize;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Photo de profil</Text>

      <View style={styles.avatarWrapper}>
        {loading ? (
          <View style={[styles.placeholder, { height: avatarSize, width: avatarSize }]}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={styles.placeholderText}>Chargement…</Text>
          </View>
        ) : photoUri ? (
          <Image
            accessibilityLabel="Photo de profil"
            source={{ uri: photoUri }}
            style={[styles.avatar, { height: avatarSize, width: avatarSize }]}
          />
        ) : (
          <View style={[styles.placeholder, { height: avatarSize, width: avatarSize }]}>
            <View style={styles.placeholderInner} />
            <Text style={styles.placeholderText}>Aucune photo</Text>
          </View>
        )}
      </View>

      {error ? <ErrorMessage message={error} /> : null}

      <Button
        disabled={isCapturing || loading}
        loading={isCapturing}
        onPress={onTakePhoto}
        title="Prendre une photo"
        variant="secondary"
      />
    </View>
  );
}

export const ProfileAvatar = memo(ProfileAvatarComponent);

const styles = StyleSheet.create({
  container: {
    ...commonStyles.cardElevated,
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    ...theme.typography.overline,
    alignSelf: 'flex-start',
    color: theme.colors.textTertiary,
  },
  avatarWrapper: {
    alignItems: 'center',
  },
  avatar: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    borderWidth: 2,
  },
  placeholder: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  placeholderInner: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.radius.full,
    height: 48,
    marginBottom: theme.spacing.sm,
    width: 48,
  },
  placeholderText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});
