import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { commonStyles, theme } from '@/lib/theme';

interface NotificationsCardProps {
  status: string | null;
  isTesting: boolean;
  onTest: () => void;
}

function NotificationsCardComponent({ status, isTesting, onTest }: NotificationsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.overline}>Notifications</Text>
      <Text style={styles.title}>Rappels automatiques</Text>
      <Text style={styles.hint}>
        Un rappel est planifié la veille (9 h) pour chaque entrée avec une date limite.
      </Text>
      <Text style={styles.status}>{status ?? 'Configuration en cours…'}</Text>
      <Button
        disabled={isTesting}
        loading={isTesting}
        onPress={onTest}
        size="compact"
        title="Tester une notification"
        variant="secondary"
      />
    </View>
  );
}

export const NotificationsCard = memo(NotificationsCardComponent);

const styles = StyleSheet.create({
  card: {
    ...commonStyles.card,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  overline: {
    ...theme.typography.overline,
    color: theme.colors.textTertiary,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  hint: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  status: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
});
