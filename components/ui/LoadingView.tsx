import { memo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/lib/theme';

interface LoadingViewProps {
  message?: string;
}

function LoadingViewComponent({ message = 'Chargement…' }: LoadingViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.indicatorWrapper}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

export const LoadingView = memo(LoadingViewComponent);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  indicatorWrapper: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    width: 72,
    ...theme.shadows.sm,
  },
  message: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
});
