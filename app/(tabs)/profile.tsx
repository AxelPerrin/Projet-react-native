import { useCallback, useRef } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useCamera } from '@/hooks/useCamera';
import { useProfile } from '@/hooks/useProfile';
import { commonStyles, theme } from '@/lib/theme';
import { useAuth } from '@/providers/AuthProvider';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { email, isSigningOut, errorMessage, signOut } = useProfile();
  const { photoUri, loading, error, isCapturing, takePhoto } = useCamera(user?.id);
  const signOutInFlightRef = useRef(false);

  const handleSignOut = useCallback(() => {
    if (signOutInFlightRef.current || isSigningOut) {
      return;
    }

    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => {
            if (signOutInFlightRef.current) {
              return;
            }
            signOutInFlightRef.current = true;
            void signOut().finally(() => {
              signOutInFlightRef.current = false;
            });
          },
        },
      ],
    );
  }, [isSigningOut, signOut]);

  return (
    <SafeAreaView style={commonStyles.screen} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.overline}>Compte</Text>
          <Text style={styles.title}>Profil</Text>
        </View>

        <ProfileAvatar
          error={error}
          isCapturing={isCapturing}
          loading={loading}
          onTakePhoto={takePhoto}
          photoUri={photoUri}
        />

        <View style={styles.card}>
          <Text style={styles.label}>E-mail</Text>
          <Text style={styles.value}>{email}</Text>
        </View>

        {errorMessage ? (
          <ErrorMessage message={errorMessage} style={styles.signOutError} />
        ) : null}

        <Button
          disabled={isSigningOut}
          loading={isSigningOut}
          onPress={handleSignOut}
          title="Déconnexion"
          variant="danger"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  overline: {
    ...theme.typography.overline,
    color: theme.colors.textTertiary,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  card: {
    ...commonStyles.card,
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.overline,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  value: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  signOutError: {
    marginBottom: theme.spacing.md,
  },
});
