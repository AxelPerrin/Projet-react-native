import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/lib/theme';

interface EmptyStateProps {
  title: string;
  description?: string;
}

function EmptyStateComponent({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconPlaceholder} />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

export const EmptyState = memo(EmptyStateComponent);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  iconPlaceholder: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    height: 56,
    marginBottom: theme.spacing.md,
    width: 56,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  description: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    maxWidth: 280,
    textAlign: 'center',
  },
});
