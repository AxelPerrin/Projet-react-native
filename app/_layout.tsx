import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { isAuthenticated } from '@/lib/auth';
import { commonStyles } from '@/lib/theme';
import { configureNotificationHandler } from '@/services/notifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';

import { LoadingView } from '@/components/ui/LoadingView';

configureNotificationHandler();

export const unstable_settings = {
  initialRouteName: '(auth)/login',
};

function RootNavigator() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const authenticated = isAuthenticated(session);

    if (!authenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (authenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments, router]);

  if (loading) {
    return (
      <View style={commonStyles.screen}>
        <LoadingView />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
